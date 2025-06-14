import React from "react";
import "./Header.css";
import githubIcon from "../../Picture/github.png";
import linkedinIcon from "../../Picture/linkedin.png";
import instagramIcon from "../../Picture/instagram-new.png";
import twitterIcon from "../../Picture/X_logo_2023_white.png";


function Header ({toggleMenu , menuOpen}) {
   /* const [isOpen, setIsOpen] = useState(true);*/
    return (
            <div className={`menu-overlay ${menuOpen ? "open" : "close"}`}>
              <div className="menu-content">
                <button className="close-button" onClick={toggleMenu}>
                   CLOSE
                </button>
                <div className="menu-container">
                <ul className="menu-list">
                  {[
                    "Home",
                    "Team",
                    "FAQs",
                    "Socials",
                    "Donate",
                    "Contact us",
                  ].map((item, index) => (
                    <li key={index}>
                      <span>{String(index + 1).padStart(2, "0")}</span> {item}
                    </li>
                  ))}
                </ul>
               <div className="social-icons">
               {[githubIcon, twitterIcon, instagramIcon, linkedinIcon].map((icon, index) => (
                <div key={index} className="social-icon-container">
                  <img src={icon} alt="Social Icon" className="social-icon" /> 
                </div>
              )) }
                </div>
                </div> 
              </div>
            </div>
          
    );
};

export default  Header;