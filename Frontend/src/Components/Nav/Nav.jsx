import React, { useState, useRef } from "react";
import "./Nav.css";
import Header from "../Header/Header";
import aicomicLogo from "../../Picture/aicomic2.jpg";
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useNavigate } from 'react-router-dom';

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginHovered, setLoginHovered] = useState(false);
  const loginRef = useRef(null);
  const navigate = useNavigate();
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useGSAP(() => {
    const letterSpans = loginRef.current?.querySelectorAll('.login-letter');
    
    if (loginHovered && letterSpans) {
      letterSpans.forEach((span, index) => {
        gsap.to(span, {
          opacity: 0.1, 
          duration: 0.12, 
          repeat: 5, 
          yoyo: true,
          delay: index * 0.08,
          ease: "power2.inOut"
        });
      });
    } else if (letterSpans) {
      gsap.set(letterSpans, { opacity: 1 });
    }
  }, [loginHovered]);

  return (
    <>
      <nav className="navbar">
        <div className="logo-container">
          <img src={aicomicLogo} alt="AIComicX Logo" className="logo" />
        </div>

        <div className="nav-right">
          <button 
            className="login-button"
            onMouseEnter={() => setLoginHovered(true)}
            onMouseLeave={() => setLoginHovered(false)}
            onClick={() => navigate('/user/Login')}
          >
            <span 
              ref={loginRef}
              className="login-text"
            >
              {'LOGIN'.split('').map((letter, index) => (
                <span key={index} className="login-letter">
                  {letter}
                </span>
              ))}
            </span>
          </button>

          <div className="hamburger-container" onClick={toggleMenu}>
            <div className={`hamburger ${menuOpen ? "open" : ""}`}>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </div>
          </div>
        </div>
      </nav>

      <Header toggleMenu={toggleMenu} menuOpen={menuOpen} />
    </>
  );
}

export default Nav;