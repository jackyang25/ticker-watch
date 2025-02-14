import React, { useState, useEffect } from "react";

const RSS_URL = "https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC&region=US&lang=en-US";

const NewsFeed = () => {
    const [news, setNews] = useState([]);

    useEffect(() => {
        const fetchRSS = async () => {
            try {
                const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`);
                const data = await response.json();
                console.log("📰 RSS News Data:", data); // ✅ Debugging: Check response structure

                if (data.items) {
                    // ✅ Ensure each article has a timestamp
                    const formattedNews = data.items.slice(0, 10).map((article) => {
                        console.log("📌 Article Data:", article); // ✅ Check if `pubDate` exists

                        let formattedTime = "00:00"; // Default in case `pubDate` is missing
                        if (article.pubDate) {
                            const pubDate = new Date(article.pubDate);
                            const hours = pubDate.getHours().toString().padStart(2, "0");
                            const minutes = pubDate.getMinutes().toString().padStart(2, "0");
                            formattedTime = `${hours}:${minutes}`;
                        }

                        return {
                            ...article,
                            formattedTime, // ✅ Add formatted time to each article
                        };
                    });

                    setNews(formattedNews);
                }
            } catch (error) {
                console.error("❌ Error fetching news:", error);
            }
        };

        fetchRSS();
        const interval = setInterval(fetchRSS, 60000); // Refresh every 60 sec

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="news-sidebar">
            <h2>📢 Latest Finance News</h2>
            <ul>
                {news.map((article, index) => (
                    <li key={index}>
                        <span className="news-time">[{article.formattedTime}]</span> {/* ✅ Ensure time is displayed */}
                        <a href={article.link} target="_blank" rel="noopener noreferrer">
                            {article.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NewsFeed;
