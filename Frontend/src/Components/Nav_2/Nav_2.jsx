import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Nav_2.css";
import Header from "../Header/Header";

function Nav_2({ showBack, onBackClick }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <>
            <nav className="Navbar nav_2">
                {showBack ? (
                    <button className="back-btn" onClick={onBackClick}>
                        <span className="back-arrow">←</span> BACK
                    </button>
                ) : (
                    <button className="back-btn" onClick={() => navigate("/")}>
                        <span className="back-arrow">←</span> HOME
                    </button>
                )}

                <div className="menu" onClick={toggleMenu}>
                    <span className="menu-text">MENU</span>
                </div>
            </nav>

            <Header toggleMenu={toggleMenu} menuOpen={menuOpen} />
        </>
    );
}

export default Nav_2;