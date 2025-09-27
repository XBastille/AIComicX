import React from "react";
import "./Header.css";
import githubIcon from "../../../Picture/github.png";
import linkedinIcon from "../../../Picture/linkedin.png";
import instagramIcon from "../../../Picture/instagram-new.png";
import twitterIcon from "../../../Picture/X_logo_2023_white.png";

function Header({toggleMenu, menuOpen}) {
    return (
        <div className={`menu-overlay ${menuOpen ? "open" : "close"}`}>
            <div className="menu-content">
                <div className="menu-layout">
                    <div className="navigation-section">
                        <ul className="menu-list">
                            {[
                                "Home",
                                "License", 
                                "Socials",
                                "Donate",
                                "Contact us",
                            ].map((item, index) => (
                                <li key={index} className="menu-item">
                                    {item === "License" ? (
                                        <a 
                                            href="https://github.com/XBastille/AIComicX/blob/main/LICENSE" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="menu-link"
                                        >
                                            {item}
                                        </a>
                                    ) : (
                                        <span className="menu-link">{item}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="social-section">
                        <div className="social-icons">
                            {[
                                { icon: githubIcon, alt: "GitHub" },
                                { icon: twitterIcon, alt: "Twitter/X" },
                                { icon: instagramIcon, alt: "Instagram" },
                                { icon: linkedinIcon, alt: "LinkedIn" }
                            ].map((social, index) => (
                                <div key={index} className="social-icon-container">
                                    <img src={social.icon} alt={social.alt} className="social-icon" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;