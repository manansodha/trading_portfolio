// components/TradingViewWidget.js
import React, { useEffect, useRef } from 'react';

const TradingViewWidget = ({ symbol }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;

    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          width: "100%",
          height: 500,
          symbol: `BSE:${symbol}`,  // Example: NSE:INFY
          interval: "D",
          timezone: "Asia/Kolkata",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: true,
          "show_popup_button": true,
          "popup_width": "1000",
          "popup_height": "650",
          container_id: `tradingview_${symbol}`,
        });
      }
    };

    containerRef.current.appendChild(script);
  }, [symbol]);

  return (
    <div ref={containerRef}>
      <div id={`tradingview_${symbol}`} />
    </div>
  );
};

export default TradingViewWidget;
