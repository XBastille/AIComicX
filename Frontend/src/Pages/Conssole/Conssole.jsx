
import React, { useEffect, useState } from 'react';
import './Conssole.css'
import aicomicx2 from "../../Picture/aicomic2.jpg"
import SideNav from '../../Components/SideNav/SideNav';
// import upArrow from '../../Picture/up.png'
// import downArrow from '../../Picture/down.png'
import One from '../../Components/Grid/panel1/One'
import Gridss from '../../Components/Grid/panel2/Gridss'
import Gridss1 from '../../Components/Grid/panel2/Gridss1'
import Grids from '../../Components/Grid/panel3/Grids'
import Grids1 from '../../Components/Grid/panel3/Grids1';
import Grids2 from '../../Components/Grid/panel3/Grids2'
import Grid from '../../Components/Grid/panel4/Grid'
import Grid1 from '../../Components/Grid/panel4/Grid1'
import Grid2 from '../../Components/Grid/panel4/Grid2'
import Grid3 from '../../Components/Grid/panel4/Grid3';

const PanelGridCount = {
    Panel1: 1,
    Panel2: 2,
    Panel3: 3,
    Panel4: 4
}

function Conssole() {

    const [showAbout, setShowAbout] = useState(false);
    const [activePanel, SetactivePanel] = useState('')
    const [panel, setpanel] = useState('Panel3');

    const defaults = (panel) => {
        if (panel === 'Panel1') {
            SetactivePanel('Panel1_Grid1')
        }
        else if (panel === 'Panel2') {
            SetactivePanel('Panel2_Grid1')
        }
        else if (panel === 'Panel3') {
            SetactivePanel('Panel3_Grid1')
        }
        else if (panel === 'Panel4') {
            SetactivePanel('Panel4_Grid1')
        }
    }
    const renderGrid = () => {
        switch (activePanel) {
            case 'Panel1_Grid1':
                return <One />
            case 'Panel2_Grid1':
                return <Gridss />
            case 'Panel2_Grid2':
                return <Gridss1 />
            case 'Panel3_Grid1':
                return <Grids />
            case 'Panel3_Grid2':
                return <Grids1 />
            case 'Panel3_Grid3':
                return <Grids2 />
            case 'Panel4_Grid1':
                return <Grid />
            case 'Panel4_Grid2':
                return <Grid1 />
            case 'Panel4_Grid3':
                return <Grid2 />
            case 'Panel4_Grid4':
                return <Grid3 />
            default:
                defaults(panel)
        }
    }

    const gridOptions = [];
    for (let i = 1; i <= (PanelGridCount[panel] || 1); i++) {
        gridOptions.push({
            value: `${panel}_Grid${i}`,
            label: `Grid${i}`,
        })

    }


    return (
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

                <select
                    className="grid-box"
                    value={activePanel}
                    onChange={e => SetactivePanel(e.target.value)}
                >
                    {gridOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                <select className="panel-box" value={panel} disabled>
                    <option value={panel}>{panel.replace('Panel', 'Panel ')}</option>
                </select>

                <div className='logocomic'>
                    <img src={aicomicx2} className='Logo'></img>
                </div>


                <select className="Font-box">
                    <option value="Font1">ANIME</option>
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

            {/* <img src={upArrow} className='upLogo'></img>
            <img src={downArrow} className='downLogo'></img> */}
            <div className="grid-container">
                {renderGrid()}
            </div>

            <div className="bottom-bar">
                <button className="about-btn" onClick={() => setShowAbout(true)}>About</button>
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


export default Conssole; ``