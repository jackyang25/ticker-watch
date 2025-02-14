from fastapi import FastAPI, HTTPException
import yfinance as yf
import requests
from fastapi.middleware.cors import CORSMiddleware
from typing import List

app = FastAPI()

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (Adjust this in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

YAHOO_API_URL = "https://query1.finance.yahoo.com/v8/finance/chart"

@app.get("/stock/{ticker}")
def get_stock_data(ticker: str):
    """
    Fetches historical stock data from Yahoo Finance.
    """
    url = f"{YAHOO_API_URL}/{ticker}?interval=1d&range=10y"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)  # Add timeout
        if response.status_code != 200:
            return {"error": f"Yahoo Finance returned status code {response.status_code}"}
        
        data = response.json()
        if "chart" not in data or "result" not in data["chart"]:
            return {"error": "Invalid response structure from Yahoo Finance"}
        
        return data  # Return valid stock data

    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to fetch stock data: {str(e)}"}

@app.post("/rsi")
def get_rsi(prices: List[float]):
    """
    Accepts a list of closing prices and returns RSI values.
    Example Input: [45, 46, 47, 50, 48, 47, 49, 51, 52, 53]
    """
    if len(prices) < 14:
        raise HTTPException(status_code=400, detail="Need at least 14 prices to calculate RSI")

    rsi_values = calculate_rsi(prices)
    return {"rsi": rsi_values}

@app.get("/price/{symbol}")
def get_stock_price(symbol: str):
    """
    Fetches the latest stock price using yfinance.
    """
    try:
        stock = yf.Ticker(symbol)
        stock_info = stock.info  # Get only key stock data
        
        # 🔥 Check multiple fields for the stock price
        latest_price = stock_info.get("regularMarketPrice") or \
                    stock_info.get("currentPrice") or \
                    stock_info.get("ask") or \
                    stock_info.get("bid") or \
                    stock_info.get("previousClose")

        if latest_price is None:
            return {"error": "Price not available", "symbol": symbol}

        return {
            "symbol": symbol.upper(),
            "price": round(float(latest_price), 2)  # Force clean numeric value
        }

    except Exception as e:
        return {"error": str(e)}

# ✅ Free API for Macro Data
FMP_API_KEY = "qWOvf35Z2KU0cE2wgEiCFCswdro4U68A"  # Get it from https://financialmodelingprep.com/developer/docs/
FMP_API_URL = "https://financialmodelingprep.com/api/v3/"

# ✅ Scrape CNN for Fear & Greed Index
CNN_FEAR_GREED_URL = "https://production.dataviz.cnn.io/index/fearandgreed/"

@app.get("/macro")
def get_macro_data():
    """
    Fetch Macro Economic Data (DXY, 10Y Yield, Inflation, Fed Rate).
    """
    try:
        # ✅ Alternative FMP API Endpoints
        dxy_res = requests.get(f"{FMP_API_URL}quote/DXY?apikey={FMP_API_KEY}")
        rates_res = requests.get(f"{FMP_API_URL}treasury?apikey={FMP_API_KEY}")  # ✅ Alternative endpoint for bond yields
        inflation_res = requests.get(f"{FMP_API_URL}economic?apikey={FMP_API_KEY}")  # ✅ Alternative for inflation

        # ✅ Log API responses for debugging
        print("📊 DXY Response:", dxy_res.json())
        print("📈 Treasury Response:", rates_res.json())
        print("🔥 Inflation Response:", inflation_res.json())

        # ✅ Extract Values Safely
        dxy_price = dxy_res.json()[0].get("price", "N/A") if dxy_res.status_code == 200 else "N/A"
        ten_year_yield = next((item["yield"] for item in rates_res.json() if item["symbol"] == "US10Y"), "N/A")
        inflation_rate = next((item["value"] for item in inflation_res.json() if item["symbol"] == "CPI"), "N/A")
        fed_rate = next((item["value"] for item in inflation_res.json() if item["symbol"] == "FEDFUNDS"), "N/A")

        return {
            "dxy": round(dxy_price, 2) if isinstance(dxy_price, (int, float)) else "N/A",
            "tenYearYield": f"{ten_year_yield}%" if ten_year_yield != "N/A" else "N/A",
            "inflation": f"{inflation_rate}%" if inflation_rate != "N/A" else "N/A",
            "fedRate": f"{fed_rate}%" if fed_rate != "N/A" else "N/A",
        }

    except Exception as e:
        return {"error": f"Failed to fetch macro data: {str(e)}"}


@app.get("/fear-greed")
def get_fear_greed():
    """
    Fetch Fear & Greed Index from CNN API.
    """
    try:
        response = requests.get(CNN_FEAR_GREED_URL)
        print("🚦 Fear & Greed Response:", response.json())  # ✅ Log API response

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch Fear & Greed Index")

        fear_greed_data = response.json()
        current_index = fear_greed_data["fear_and_greed"]["score"]  # Extracts the score

        return {"fearGreedIndex": current_index}

    except Exception as e:
        return {"error": f"Failed to fetch Fear & Greed Index: {str(e)}"}
    
    