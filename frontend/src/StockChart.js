import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import "./StockChart.css";

const StockChart = ({ ticker }) => {
    const chartContainerRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        if (!ticker) return;

        // Destroy the old chart before creating a new one
        if (chartInstanceRef.current) {
            chartInstanceRef.current.remove();
            chartInstanceRef.current = null;
        }

        if (!chartContainerRef.current) {
            console.error("Chart container is not found!");
            return;
        }

        // Create a new chart instance
        chartInstanceRef.current = createChart(chartContainerRef.current, {
            width: 800,
            height: 400,
            layout: {
                backgroundColor: "transparent", // Ensure transparent background
                textColor: "#C7C7F3",
            },
            grid: {
                vertLines: { color: "#1E1E30" },
                horzLines: { color: "#1E1E30" },
            },
        });

        const lineSeries = chartInstanceRef.current.addAreaSeries({
            lineColor: "#34A853",
            topColor: "rgba(52, 168, 83, 0.4)",
            bottomColor: "rgba(52, 168, 83, 0)",
            lineWidth: 2,
        });

        // Fetch stock data from FastAPI
        const fetchStockData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/stock/${ticker}`);
                const data = await response.json();
                console.log("API Response:", data);

                if (!data.chart || !data.chart.result) {
                    console.error("Invalid data received:", data);
                    return;
                }

                const result = data.chart.result[0];
                const timestamps = result.timestamp || [];
                const closingPrices = result.indicators.quote[0].close || [];

                if (timestamps.length === 0 || closingPrices.length === 0) {
                    console.error("No stock data found for", ticker);
                    return;
                }

                const chartData = timestamps.map((timestamp, index) => ({
                    time: timestamp,
                    value: closingPrices[index],
                }));

                lineSeries.setData(chartData);
                console.log("Chart data set successfully.");
            } catch (error) {
                console.error("Failed to fetch stock data:", error);
            }
        };

        fetchStockData();

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.remove();
                chartInstanceRef.current = null;
            }
        };
    }, [ticker]);

    return (
        <div className="chart-wrapper">
            <div ref={chartContainerRef} className="chart-inner" />
        </div>
    );
};

export default StockChart;
