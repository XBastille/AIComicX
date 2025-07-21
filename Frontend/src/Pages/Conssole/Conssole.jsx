import React, { useEffect, useState } from 'react';
import './Conssole.css';
import aicomicx2 from "../../Picture/aicomic2.jpg";
import SideNav from '../../Components/SideNav/SideNav';
import One from '../../Components/Grid/panel1/One';
import Gridss from '../../Components/Grid/panel2/Gridss';
import Gridss1 from '../../Components/Grid/panel2/Gridss1';
import Grids from '../../Components/Grid/panel3/Grids';
import Grids1 from '../../Components/Grid/panel3/Grids1';
import Grids2 from '../../Components/Grid/panel3/Grids2';
import Grid from '../../Components/Grid/panel4/Grid';
import Grid1 from '../../Components/Grid/panel4/Grid1';
import Grid2 from '../../Components/Grid/panel4/Grid2';
import Grid3 from '../../Components/Grid/panel4/Grid3';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faRotateRight, faTimes, faCopy, faCheck, faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';

const PanelGridCount = {
    Panel1: 1,
    Panel2: 2,
    Panel3: 3,
    Panel4: 4
};

function Conssole() {
    const [showAbout, setShowAbout] = useState(false);
    const [activePanel, SetactivePanel] = useState('');
    const [panel, setpanel] = useState('Panel1');
    const [sideNav, SetsideNav] = useState('');
    const [showPanelEditor, setShowPanelEditor] = useState(false);
    const [selectedPanel, setSelectedPanel] = useState(null);
    const [showEditControls, setShowEditControls] = useState(false);
    const [inferenceSteps, setInferenceSteps] = useState(20);
    const [guidanceScale, setGuidanceScale] = useState(7.5);
    const [seed, setSeed] = useState(42);
    const [prompt, setPrompt] = useState("A dynamic comic book scene featuring a superhero in action, flying through a futuristic cityscape with neon lights and towering skyscrapers, detailed art style, vibrant colors, dramatic lighting");
    const [showCopyNotification, setShowCopyNotification] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [inferenceSteps2, setInferenceSteps2] = useState(40);
    const [guidanceScale2, setGuidanceScale2] = useState(7.5);
    const [seed2, setSeed2] = useState(9);
    const [panelInfo, setPanelInfo] = useState([2, 2, 3, 2]);
    const [pageNo, setPageNo] = useState(0);

    useEffect(() => {
        if (panelInfo.length > 0) {
            const panelCount = panelInfo[pageNo];
            console.log(panelCount);
            const prevPanel = panel;
            setpanel('Panel' + panelCount);

            SetactivePanel(`${panel}_Grid1`);

            console.log(panel);
        }
    }, [panelInfo, pageNo, panel]);

    useEffect(() => {
        async function calling() {
            try {
                const res = await axios.get('http://localhost:3000/chat/mdToFront');
                console.log(res.data);
                SetsideNav(res.data);
            } catch (error) {
                console.log(error);
            }
        }
        calling();
    }, []);

    const defaults = (panel) => {
        if (panel === 'Panel1') {
            SetactivePanel('Panel1_Grid1');
        } else if (panel === 'Panel2') {
            SetactivePanel('Panel2_Grid1');
        } else if (panel === 'Panel3') {
            SetactivePanel('Panel3_Grid1');
        } else if (panel === 'Panel4') {
            SetactivePanel('Panel4_Grid1');
        }
    };

    const handlePanelClick = (panelIndex) => {
        setSelectedPanel(panelIndex);
        setShowPanelEditor(true);
        setShowEditControls(false);
    };

    const handleEditClick = () => {
        setShowEditControls(true);
    };

    const handleRegenerate = () => {
        console.log('Regenerating with:', {
            inferenceSteps,
            guidanceScale,
            seed,
            prompt
        });
    };

    const handleCopyPrompt = async () => {
        try {
            await navigator.clipboard.writeText(prompt);
            setShowCopyNotification(true);
            setTimeout(() => setShowCopyNotification(false), 2000);
        } catch (err) {
            console.error('Failed to copy prompt: ', err);
        }
    };

    const renderGrid = () => {
        switch (activePanel) {
            case 'Panel1_Grid1': return <One onPanelClick={handlePanelClick} />;
            case 'Panel2_Grid1': return <Gridss onPanelClick={handlePanelClick} />;
            case 'Panel2_Grid2': return <Gridss1 onPanelClick={handlePanelClick} />;
            case 'Panel3_Grid1': return <Grids onPanelClick={handlePanelClick} />;
            case 'Panel3_Grid2': return <Grids1 onPanelClick={handlePanelClick} />;
            case 'Panel3_Grid3': return <Grids2 onPanelClick={handlePanelClick} />;
            case 'Panel4_Grid1': return <Grid onPanelClick={handlePanelClick} />;
            case 'Panel4_Grid2': return <Grid1 onPanelClick={handlePanelClick} />;
            case 'Panel4_Grid3': return <Grid2 onPanelClick={handlePanelClick} />;
            case 'Panel4_Grid4': return <Grid3 onPanelClick={handlePanelClick} />;
            default: defaults(panel);
        }
    };

    const gridOptions = [];
    for (let i = 1; i <= (PanelGridCount[panel] || 1); i++) {
        gridOptions.push({
            value: `${panel}_Grid${i}`,
            label: `Grid${i}`,
        });
    }

    const handleResetDefaults = () => {
        setInferenceSteps2(40);
        setGuidanceScale2(7.5);
        setSeed2(9);
    };

    const handleApplySettings = () => {
        console.log({ inferenceSteps2, guidanceScale2, seed2 });
        setShowSettings(false);
    };

    return (
        <div className="Comic-container">
            <SideNav content={sideNav} />

            {showCopyNotification && (
                <div className="copy-notification">
                    <FontAwesomeIcon icon={faCheck} className="check-icon" />
                    Prompt copied to clipboard!
                </div>
            )}

            <div className="nav-bar">
                <select className='art-options'>
                    <option value="American">American(1950)</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Humanoid">Humanoid</option>
                    <option value="Egyptian">Egyptian</option>
                    <option value="Nihonga">Nihonga</option>
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
                    <img src={aicomicx2} className='Logo' alt="Logo" />
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

                <div className="page-indicator">
                    {pageNo + 1} / {panelInfo.length}
                </div>
            </div>



            <div className="grid-container">
                {renderGrid()}
            </div>

            <div className="navigation-page-btn-box">
                <button className='navigate-page-btn'
                    onClick={() => pageNo != 0 ? setPageNo(pageNo - 1) : 0}
                    disabled={pageNo === 0}
                >
                    <FontAwesomeIcon icon={faArrowUp} />                </button>

                <button className='navigate-page-btn'
                    onClick={() => pageNo != panelInfo.length - 1 ? setPageNo(pageNo + 1) : panelInfo.length - 1}
                    disabled={pageNo === panelInfo.length - 1}
                >
                    <FontAwesomeIcon icon={faArrowDown} />                </button>
            </div>

            <div className="bottom-bar">
                <button className="about-btn" onClick={() => setShowAbout(true)}>About</button>
                <div className='buttons-bar2'>
                    <button
                        className="settings-btn"
                        onClick={() => setShowSettings(true)}
                    >
                        Settings
                    </button>
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
                            <p>This is an open-source project licensed under the Creative Commons BY-NC-ND License. See the <a href="https://github.com/XBastille/AIComicX" target="_blank" rel="noopener noreferrer">GitHub repo</a> for more info.</p>
                            <p>📧 Reach us at <a href="mailto:eziopuhan825@gmail.com">eziopuhan825@gmail.com</a>.</p>
                        </div>
                    </div>
                </>
            )}

            {showSettings && (
                <>
                    <div className="modal-overlay" onClick={() => setShowSettings(false)} />
                    <div className="about-modal">
                        <button className="close-btn" onClick={() => setShowSettings(false)}>✖</button>
                        <div className="modal-content">
                            <p style={{ marginBottom: '1rem', color: '#f4d03f' }}>
                                ⚠️ The default settings are recommended. Changing these fields may lead to undesired results — proceed with caution!
                            </p>

                            <div className="setting-field">
                                <label>Inference Steps</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={inferenceSteps2}
                                    onChange={(e) => setInferenceSteps2(e.target.value)}
                                />
                                <div>{inferenceSteps2}</div>
                            </div>

                            <div className="setting-field">
                                <label>Guidance Scale</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    value={guidanceScale2}
                                    onChange={(e) => setGuidanceScale2(e.target.value)}
                                />
                            </div>

                            <div className="setting-field">
                                <label>Seed</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100000000"
                                    value={seed2}
                                    onChange={(e) => setSeed2(e.target.value)}
                                />
                            </div>

                            <div className="settings-buttons">
                                <button className='default-btn' onClick={handleResetDefaults}>Reset to Default</button>
                                <button className='apply-btn' onClick={handleApplySettings}>Apply</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {showPanelEditor && (
                <>
                    <div className="modal-overlay" onClick={() => setShowPanelEditor(false)} />
                    <div className="panel-editor-modal">
                        <button className="close-btn" onClick={() => setShowPanelEditor(false)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                        <div className="panel-editor-content">
                            <div className="panel-controls">
                                <h3 className="panel-title">Panel {selectedPanel}</h3>
                                <div className="parameter-info">
                                    <div className="control-group">
                                        <div className="prompt-header">
                                            <label>Prompt:</label>
                                            <button className="copy-btn" onClick={handleCopyPrompt} title="Copy prompt">
                                                <FontAwesomeIcon icon={faCopy} />
                                            </button>
                                        </div>
                                        <textarea
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            className={`prompt-input ${!showEditControls ? 'readonly' : ''}`}
                                            readOnly={!showEditControls}
                                            rows={4}
                                            placeholder="Enter your comic panel prompt here..."
                                        />
                                    </div>

                                    <div className="control-group">
                                        <label>Inference Steps: {inferenceSteps}</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="50"
                                            value={inferenceSteps}
                                            onChange={(e) => setInferenceSteps(parseInt(e.target.value))}
                                            className="slider"
                                            disabled={!showEditControls}
                                        />
                                    </div>

                                    <div className="control-group">
                                        <label>Guidance Scale:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            value={guidanceScale}
                                            onChange={(e) => setGuidanceScale(parseFloat(e.target.value) || 0)}
                                            className="number-input"
                                            readOnly={!showEditControls}
                                        />
                                    </div>

                                    <div className="control-group">
                                        <label>Seed:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100000000"
                                            value={seed}
                                            onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                                            className="number-input"
                                            readOnly={!showEditControls}
                                        />
                                    </div>
                                </div>
                                {showEditControls ? (
                                    <button className="regenerate-btn" onClick={handleRegenerate}>
                                        <FontAwesomeIcon icon={faRotateRight} /> Regenerate
                                    </button>
                                ) : (
                                    <button className="edit-btn" onClick={handleEditClick}>
                                        <FontAwesomeIcon icon={faEdit} /> Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Conssole;
