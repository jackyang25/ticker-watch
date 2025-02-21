import React, { useEffect, useState } from "react";
import axios from "axios";
import "./LeftSidebar.css";

const API_BASE_URL = "http://127.0.0.1:8000"; // Your FastAPI Backend URL

const LeftSidebar = ({ reports, onReportClick }) => {
    const [marketData, setMarketData] = useState({
        sp500: "Loading...",
        nasdaq: "Loading...",
        dow: "Loading...",
        bitcoin: "Loading...",
        eggs: "Loading...",
        oil: "Loading...",
    });

    const [macroData, setMacroData] = useState({
        dxy: "Loading...",
        tenYearYield: "Loading...",
        inflation: "Loading...",
        fedRate: "Loading...",
        fearGreedIndex: "Loading...",
    });

    // Fetch Data from Your FastAPI Backend
    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                console.log("🔍 Fetching market data...");

                // Fetch Stock Prices from FastAPI (`yfinance`)
                const sp500Res = await axios.get(`${API_BASE_URL}/price/%5EGSPC`);
                const nasdaqRes = await axios.get(`${API_BASE_URL}/price/%5EIXIC`);
                const dowRes = await axios.get(`${API_BASE_URL}/price/%5EDJI`);
                const bitcoinRes = await axios.get(`${API_BASE_URL}/price/BTC-USD`);
                const oilRes = await axios.get(`${API_BASE_URL}/price/CL=F`);

                // Update Sidebar Data
                setMarketData({
                    sp500: `$${sp500Res.data.price}` || "N/A",
                    nasdaq: `$${nasdaqRes.data.price}` || "N/A",
                    dow: `$${dowRes.data.price}` || "N/A",
                    bitcoin: `$${bitcoinRes.data.price}` || "N/A",
                    eggs: "$4.50/dozen", // Static example
                    oil: `$${oilRes.data.price}` || "N/A",
                });

                // Fetch Macro Data (DXY, Yields, Inflation, Fed Rate)
                const macroRes = await axios.get(`${API_BASE_URL}/macro`);
                const fearGreedRes = await axios.get(`${API_BASE_URL}/fear-greed`);

                setMacroData({
                    dxy: macroRes.data.dxy || "N/A",
                    tenYearYield: macroRes.data.tenYearYield || "N/A",
                    inflation: macroRes.data.inflation || "N/A",
                    fedRate: macroRes.data.fedRate || "N/A",
                    fearGreedIndex: fearGreedRes.data.fearGreedIndex || "N/A",
                });

            } catch (error) {
                console.error("🚨 Error fetching market data:", error);
            }
        };

        fetchMarketData();
    }, []);

    return (
        <div className="left-sidebar">
            {/* 🌍 Market Summary */}
            <div className="market-summary">
                <h2>🌍 Market Summary</h2>
                <p>📊 S&P 500: {marketData.sp500}</p>
                <p>📉 NASDAQ: {marketData.nasdaq}</p>
                <p>📈 DOW JONES: {marketData.dow}</p>
                <hr />
                <p>💰 Bitcoin: {marketData.bitcoin}</p>
                <p>🥚 Eggs: {marketData.eggs}</p>
                <p>🛢️ Crude Oil: {marketData.oil}</p>
            </div>

            {/* 📊 Macro Economic Data */}
            <div className="macro-data">
                <h2>📊 Macro Data</h2>
                <p>💵 DXY (Dollar Index): {macroData.dxy}</p>
                <p>📈 10Y Yield: {macroData.tenYearYield}</p>
                <p>🔥 Inflation Rate: {macroData.inflation}</p>
                <p>🏦 Fed Interest Rate: {macroData.fedRate}</p>
            </div>

            {/* 🚦 Fear & Greed Index */}
            <div className="fear-greed">
                <h2>🚦 Fear & Greed Index</h2>
                <p className={`fg-score ${getFearGreedClass(parseInt(macroData.fearGreedIndex))}`}>
                    {macroData.fearGreedIndex} / 100 — <span className="fg-label">
                        {getFearGreedLabel(parseInt(macroData.fearGreedIndex))}
                    </span>
                </p>
            </div>

            {/* 📜 Previous Reports */}
            <div className="previous-reports">
                <h2>📜 Previous Reports</h2>
                {reports.length === 0 ? (
                    <p>No reports yet.</p>
                ) : (
                    <ul>
                        {reports.map((report, index) => (
                            <li 
                                key={index} 
                                className="report-item"
                                onClick={() => onReportClick(report.ticker)}
                            >
                                {report.ticker} <span className="report-time">{report.time}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

// Function to Assign a Class Based on Fear & Greed Index Value
const getFearGreedClass = (score) => {
    if (score >= 70) return "greed";
    if (score >= 50) return "neutral";
    if (score >= 30) return "fear";
    return "extreme-fear";
};

// Function to Assign a Label for Fear & Greed Score
const getFearGreedLabel = (score) => {
    if (score >= 80) return "Extreme Greed";
    if (score >= 60) return "Greed";
    if (score >= 40) return "Neutral";
    if (score >= 20) return "Fear";
    if (score >= 0) return "Extreme Fear"
    return "?";
};

export default LeftSidebar;
