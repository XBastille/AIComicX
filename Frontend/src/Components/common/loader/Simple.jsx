import React from "react";
import './Simple.css'

const LoadingSpinner = () => {
    return (
        <div className="loading-overlay">
            <div className="loading-containers">
                <div className="loading-spinner"></div>
                <p>Generating</p>
                <span className="loading-text-animation-dot1">.</span>
                <span className="loading-text-animation-dot2">.</span>
                <span className="loading-text-animation-dot3">.</span>
            </div>
        </div>
    )
};

export default LoadingSpinner;