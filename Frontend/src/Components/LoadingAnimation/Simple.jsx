import React from "react";
import './Simple.css'

const LoadingSpinner = () => {
    return (
        <div className="loading-overlay">
            <div className="loading-containers">
                <div className="loading-spinner"></div>
            </div>
        </div>
    )
};

export default LoadingSpinner;