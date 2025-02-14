import yfinance as yf
import pandas as pd

def calculate_rsi(prices, window=14):
    """
    Calculate RSI using a simple list of prices.
    """
    if len(prices) < window:
        return {"error": "Not enough data points to calculate RSI"}

    df = pd.DataFrame(prices, columns=["Close"])
    delta = df["Close"].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()

    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))

    return rsi.fillna(50).tolist()  # Fill NaN with 50 for neutral RSI
