import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './SideNav.css';

function SideNav({ content }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleNav = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`side-nav ${isOpen ? 'open' : ''}`}>
            <div className="side-nav-content">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
            <button className="toggle-btn" onClick={toggleNav}>
                {isOpen ? '←' : '→'}
            </button>
        </div>
    );
}

export default SideNav;