
import React, { useState } from 'react';
import './Conssole.css'
import aicomicx2 from "../../Picture/aicomic2.jpg"
import SideNav from '../../Components/SideNav/SideNav';
import upArrow from '../../Picture/up.png'
import downArrow from '../../Picture/down.png'



function Conssole(){
    
    const [showAbout, setShowAbout] = useState(false);
    return(
     <div className="Comic-container">
      <SideNav />
         <div className="nav-bar">
            <select className='art-options'>
                <option value="American" >American(1950)</option>
                <option value="Japanese" >Japanese</option>
                <option value="Humanoid" >Humanoid</option>
                <option value="Egyptian" >Egyptian</option>
                <option value="Nihonga" >Nihonga</option>
            </select>

        <select className="grid-box">
            <option  value="Grid">Grid 1</option>
            <option value="Grid 1">Grid 2</option>
            <option value="Grid 2">Grid 3</option>
            <option value="Grid 3">Grid 4</option>
        </select>

        <select classNmae="panel-box">
          <option value="Panel">Panel 1</option> 
        </select>

        <div className='logocomic'>
        <img src={aicomicx2} className='Logo'></img>
        </div>
           

         <select className="Font-box">
            <option  value="Font1">ANIME</option>
            <option value="Font2">MANGA</option>
        </select>

        <select className='comic-theme'>
            <option value="theme1">Default</option>
            <option value="theme2">Serpia Colors</option>
            <option value="theme3">Noir Colors</option>
            <option value="theme4">Modern Colors</option>
        </select>
        

        <button className='generate-button'>Generate Comic</button>

         </div>
        
        <img src={upArrow} className='upLogo'></img>
        <img src={downArrow} className='downLogo'></img>
        

         <div className="bottom-bar">
        <button className="about-btn"  onClick={() => setShowAbout(true)}>About</button>
        <div className='buttons-bar2'>
        <button className="settings-btn">Settings</button>
        <button className="pdf-btn">Get PDF</button>
        </div>
        </div>
        {showAbout && (
        <>
          <div className="modal-overlay" onClick={() => setShowAbout(false)} />
          <div className="about-modal">
            <button className="close-btn" onClick={() => setShowAbout(false)}>✖</button>
            <div className="modal-content">
              <h2>AIComicX 1.0 (May 2025)</h2>
              <p>AIComicX is an AI-powered platform that transforms your stories into stunning comics with ease.</p>
              <p><strong>Default Image Generation Model:</strong> Stable Diffusion 3.5</p>
              <p>
                This is an open-source project licensed under the Creative Commons BY-NC-ND License.
                See the <a href="https://github.com/XBastille/AIComicX" target="_blank" rel="noopener noreferrer">GitHub repo</a> for more info.
              </p>
              <p>📧 Reach us at <a href="mailto:eziopuhan825@gmail.com">eziopuhan825@gmail.com</a>.</p>
            </div>
          </div>
        </>
      )}
     </div>
    )
}


export default Conssole;