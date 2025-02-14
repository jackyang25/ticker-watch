import React, { useState, useEffect } from "react";
import Marquee from "react-fast-marquee";

const API_URL = "http://127.0.0.1:8000/price"; // ✅ FastAPI backend URL

const TickerCarousel = () => {
    const [tickers, setTickers] = useState([
        { symbol: "AAPL", price: "Loading..." },  // Apple
        { symbol: "TSLA", price: "Loading..." },  // Tesla
        { symbol: "MSFT", price: "Loading..." },  // Microsoft
        { symbol: "GOOG", price: "Loading..." },  // Google
        { symbol: "AMZN", price: "Loading..." },  // Amazon
        { symbol: "MSTR", price: "Loading..." },  // MicroStrategy
        { symbol: "NVDA", price: "Loading..." },  // NVIDIA
        { symbol: "META", price: "Loading..." },  // Meta (Facebook)
        { symbol: "NFLX", price: "Loading..." },  // Netflix
        { symbol: "BRK.B", price: "Loading..." }, // Berkshire Hathaway (Class B)
        { symbol: "JPM", price: "Loading..." },   // JPMorgan Chase
        { symbol: "AMD", price: "Loading..." },   // AMD
        { symbol: "PYPL", price: "Loading..." },  // PayPal
    ]);

    useEffect(() => {
        const fetchStockPrices = async () => {
            try {
                const updatedTickers = await Promise.all(
                    tickers.map(async (ticker) => {
                        const response = await fetch(`${API_URL}/${ticker.symbol}`);
                        const data = await response.json();
                        console.log(`📢 API Response for ${ticker.symbol}:`, data);

                        return {
                            ...ticker,
                            price: data?.price ? `$${data.price.toFixed(2)}` : "N/A"
                        };
                    })
                );

                setTickers(updatedTickers);
            } catch (error) {
                console.error("❌ Error fetching stock prices:", error);
            }
        };

        fetchStockPrices();
        const interval = setInterval(fetchStockPrices, 10000); // Fetch every 10 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ backgroundColor: "#0D0D1F", padding: "10px 0", color: "#FFF", fontSize: "18px" }}>
            <Marquee gradient={false} speed={50}>
                {tickers.map((ticker, index) => (
                    <span key={index} style={{ marginRight: "30px", fontWeight: "bold" }}>
                        {ticker.symbol}: {ticker.price}
                    </span>
                ))}
            </Marquee>
        </div>
    );
};

export default TickerCarousel;
