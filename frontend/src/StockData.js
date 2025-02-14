import React from "react";
import "./StockData.css"; // Import styling for this component

function StockData({ ticker }) {
    if (!ticker) return null; // Don't render if no stock is selected

    return (
        <div className="stock-data-container">
            <h3>{ticker} Stock Data</h3>
            <div className="stock-info">
                <p>📊 Market Cap: $1.5B</p>
                <p>📈 Daily High: $130</p>
                <p>📉 Daily Low: $115</p>
                <p>🔄 Volume: 500K</p>
            </div>
        </div>
    );
}

export default StockData;
