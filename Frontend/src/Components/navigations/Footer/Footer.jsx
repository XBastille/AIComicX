import React from "react";
import aicomicx2 from "../../../Picture/aicomic2.jpg"
import './Footer.css'

function Footer () {
    return (
     <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">
            <img src={aicomicx2} className="logo-image"></img>
          </div>

          <div className="footer-links">
            <div>
                <p id="Home">Home</p>
                <p id="Team">Team</p>
                <p id="Socials">Socials</p>
            </div>

            <div>
                <p id="FAQ">FAQs</p>
                <p id="Donate">Donate</p>
                <p id="Contact">Contact Us</p>
            </div>
          </div>
        </div>
     </footer>
    )
}

export default Footer;