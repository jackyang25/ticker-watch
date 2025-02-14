import React, { useState, useEffect } from "react";
import StockChart from "./StockChart";
import StockData from "./StockData";
import TickerCarousel from "./TickerCarousel";
import NewsFeed from "./NewsFeed";
import LeftSidebar from "./LeftSidebar"; // ✅ Import Left Sidebar
import "./App.css";

function App() {
    const [ticker, setTicker] = useState("");
    const [submittedTicker, setSubmittedTicker] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Fetching data...");
    const [reports, setReports] = useState([]); // ✅ Stores previous reports

    // ✅ Cycle through fun loading messages
    useEffect(() => {
        if (loading) {
            const messages = [
                "📈 Fetching stock data...",
                "🔍 Analyzing market trends...",
                "📊 Generating insightful chart...",
            ];
            let index = 0;

            const interval = setInterval(() => {
                setLoadingMessage(messages[index]);
                index = (index + 1) % messages.length;
            }, 1500);

            return () => clearInterval(interval);
        }
    }, [loading]);

    const handleSubmit = () => {
        if (ticker.trim() !== "") {
            setLoading(true);

            setTimeout(() => {
                setSubmittedTicker(ticker);
                setReports((prevReports) => [
                    { ticker, time: new Date().toLocaleTimeString() },
                    ...prevReports,
                ]);
                setLoading(false);
            }, 5000);
        }
    };

    const handleReportClick = (selectedTicker) => {
        setLoading(true);
        setTimeout(() => {
            setSubmittedTicker(selectedTicker);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="app-container">
            {/* ✅ Stock Ticker at the top */}
            <div className="ticker-container">
                <TickerCarousel />
            </div>

            {/* ✅ Layout with Sidebar & Main Content */}
            <div className="layout">
                {/* ✅ Left Sidebar with Previous Reports & Market Summary */}
                <LeftSidebar reports={reports} onReportClick={handleReportClick} />

                {/* ✅ Main Content */}
                <div className="main-content">
                    <h1 className="shake-title">Super Stonk Analyzer <i> 3000</i> </h1>

                    <div className="input-container">
                        <input
                            type="text"
                            placeholder="Enter Stock Ticker (e.g., AAPL)"
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value.toUpperCase())}
                            className="ticker-input"
                        />
                        <button onClick={handleSubmit} className="styled-button">
                            Generate Report
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-animation">
                            <div className="progress-bar"></div>
                            <p className="loading-text">{loadingMessage}</p>
                            <h2 className="moving-ticker">{ticker || "Loading..."}</h2>
                        </div>
                    ) : (
                        submittedTicker && (
                            <>
                                <div className="chart-container">
                                    <h2>{submittedTicker} Chart</h2>
                                    <StockChart ticker={submittedTicker} />
                                </div>
                                <StockData ticker={submittedTicker} />
                            </>
                        )
                    )}
                </div>

                {/* ✅ Right-Side News Feed */}
                <NewsFeed />
            </div>
        </div>
    );
}

export default App;
