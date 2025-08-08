import React, { act, useEffect, useState } from 'react';
import './Conssole.css';
import aicomicx2 from "../../Picture/aicomic2.jpg";
import SideNav from '../../Components/SideNav/SideNav';
import One from '../../../../../../newChange/AIComicX/Frontend/src/Components/Grid/panel1/One';
import Gridss from '../../../../../../newChange/AIComicX/Frontend/src/Components/Grid/panel2/Gridss';
import Gridss1 from '../../../../../../newChange/AIComicX/Frontend/src/Components/Grid/panel2/Gridss1';
import Grids from '../../../../../../newChange/AIComicX/Frontend/src/Components/Grid/panel3/Grids';
import Grids1 from '../../../../../../newChange/AIComicX/Frontend/src/Components/Grid/panel3/Grids1';
import Grids2 from '../../../../../../newChange/AIComicX/Frontend/src/Components/Grid/panel3/Grids2';
import Grid from '../../../../../../newChange/AIComicX/Frontend/src/Components/Grid/panel4/Grid';
import Grid1 from '../../../../../../newChange/AIComicX/Frontend/src/Components/Grid/panel4/Grid1';
import Grid2 from '../../../../../../newChange/AIComicX/Frontend/src/Components/Grid/panel4/Grid2';
import Grid3 from '../../../../../../newChange/AIComicX/Frontend/src/Components/Grid/panel4/Grid3';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { API_ENDPOINTS } from "../../config/api";
import { faEdit, faRotateRight, faTimes, faCopy, faCheck, faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';

const PanelGridCount = {
    Panel1: 1,
    Panel2: 2,
    Panel3: 3,
    Panel4: 4
};

const Height_Width_data = {
    Panel1: {
        Grid1: {
            heigth: {
                box_height_0: '1216px',  // 2:3
            },
            width: {
                box_width_0: '832px',
            }
        },
    },
    Panel2: {
        Grid1: {
            heigth: {
                box_height_0: '896px',   // 5:4
                box_height_1: '896px',
            },
            width: {
                box_width_0: '1088px',
                box_width_1: '1088px',
            }
        },
        Grid2: {
            heigth: {
                box_height_0: '1088px',  // 4:5
                box_height_1: '1088px',
            },
            width: {
                box_width_0: '896px',
                box_width_1: '896px',
            }
        },
    },
    Panel3: {
        Grid1: {
            heigth: {
                box_height_0: '640px',   // 21:9
                box_height_1: '640px',
                box_height_2: '640px',
            },
            width: {
                box_width_0: '1536px',   
                box_width_1: '1536px',
                box_width_2: '1536px',
            }
        },
        Grid2: {
            heigth: {
                box_height_0: '1344px',  // 9:16 
                box_height_1: '1024px',  // 1:1
                box_height_2: '1024px',
            },
            width: {
                box_width_0: '768px',
                box_width_1: '1024px',
                box_width_2: '1024px',
            }
        },
        Grid3: {
            heigth: {
                box_height_0: '1024px',  // 1:1 
                box_height_1: '1024px',
                box_height_2: '768px',   // 16:9 
            },
            width: {
                box_width_0: '1024px',
                box_width_1: '1024px',
                box_width_2: '1344px',
            }
        },
    },
    Panel4: {
        Grid1: {
            heigth: {
                box_height_0: '1088px',  // 4:5
                box_height_1: '1088px',
                box_height_2: '1088px',
                box_height_3: '1088px',
            },
            width: {
                box_width_0: '896px',
                box_width_1: '896px',
                box_width_2: '896px',
                box_width_3: '896px',
            }
        },
        Grid2: {
            heigth: {
                box_height_0: '768px',   // 16:9 
                box_height_1: '1088px',  // 4:5 
                box_height_2: '1088px',
                box_height_3: '768px',
            },
            width: {
                box_width_0: '1344px',
                box_width_1: '896px',
                box_width_2: '896px',
                box_width_3: '1344px',
            }
        },
        Grid3: {
            heigth: {
                box_height_0: '1344px',  // 9:16
                box_height_1: '1344px',
                box_height_2: '1536px',  // 9:21 
                box_height_3: '1024px',   // 1:1
            },
            width: {
                box_width_0: '768px',
                box_width_1: '768px',
                box_width_2: '640px',
                box_width_3: '1024px',
            }
        },
        Grid4: {
            heigth: {
                box_height_0: '832px',   // 3:2 landscape (1216x832)
                box_height_1: '1344px',  // 9:16 
                box_height_2: '1344px',
                box_height_3: '832px',
            },
            width: {
                box_width_0: '1216px',
                box_width_1: '768px',
                box_width_2: '768px',
                box_width_3: '1216px',
            }
        }
    }
};




function Conssole() {
    const [showAbout, setShowAbout] = useState(false);
    const [activePanel, SetactivePanel] = useState('');
    const [panel, setpanel] = useState('');
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
    const [panelInfo, setPanelInfo] = useState([]);
    const [pageNo, setPageNo] = useState(0);
    const [artStyle, setArtStyle] = useState('ANIME');
    const [grid, setgrid] = useState("");
    const [height_width, setheight_width] = useState([]);

    //Image transfer states ,uing as props
    //panel1
    const [panel1_grid1, setpanel1_grid1] = useState([]);
    //panel2
    const [panel2_grid1, setpanel2_grid1] = useState([]);
    const [panel2_grid2, setpanel2_grid2] = useState([]);
    //panel3
    const [panel3_grid1, setpanel3_grid1] = useState([]);
    const [panel3_grid2, setpanel3_grid2] = useState([]);
    const [panel3_grid3, setpanel3_grid3] = useState([]);
    //panel4
    const [panel4_grid1, setpanel4_grid1] = useState({});
    const [panel4_grid2, setpanel4_grid2] = useState({});
    const [panel4_grid3, setpanel4_grid3] = useState({});
    const [panel4_grid4, setpanel4_grid4] = useState({});

    useEffect(() => {
        async function calling() {
            try {
                const res = await axios.get(API_ENDPOINTS.mdToFront);
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
        //    console.log({ inferenceSteps2, guidanceScale2, seed2 });
        setShowSettings(false);
    };


    //panel_data from backend
    useEffect(() => {
        const get_panel_data = async () => {
            try {
                const res = await axios.get(API_ENDPOINTS.panelData);
                const raw_data = (res.data);

                const initialPanelInfo = raw_data.map(panel => [panel, 1]);

                setPanelInfo(initialPanelInfo)
            } catch (error) {
                console.log(error);
            }
        }
        get_panel_data();
    }, []);


    useEffect(() => {
        if (panelInfo.length > 0) {
            const panelCount = panelInfo[pageNo][0];
            const gridCount = panelInfo[pageNo][1];
            const prevPanel = panel;

            const newPanel = `Panel${panelCount}`;
            const newGrid = `Grid${gridCount}`;
            const newActivePanel = `${newPanel}_${newGrid}`;

            setpanel(newPanel);
            setgrid(newGrid);
            SetactivePanel(newActivePanel);
        }
    }, [panelInfo, pageNo]);

    // extracting height, width of all the panel and grid
    useEffect(() => {
        if (panel && grid) {
            const heights = Height_Width_data[panel]?.[grid]?.heigth
            const widths = Height_Width_data[panel]?.[grid].width

            const result = Object.keys(heights).map((key, index) => {
                const heightValue = heights[`box_height_${index}`];
                const widthValue = widths[`box_width_${index}`]
                return [widthValue, heightValue,]
            })
            setheight_width(result)
        }

    }, [panel, grid])

    //rendering and passing images as props
    const renderGrid = () => {
        const page_no = pageNo + 1;
        switch (activePanel) {
            case 'Panel1_Grid1': return <One images={panel1_grid1[page_no] || []} onPanelClick={handlePanelClick} />;
            case 'Panel2_Grid1': return <Gridss images={panel2_grid1[page_no] || []} onPanelClick={handlePanelClick} />;
            case 'Panel2_Grid2': return <Gridss1 images={panel2_grid2[page_no] || []} onPanelClick={handlePanelClick} />;
            case 'Panel3_Grid1': return <Grids images={panel3_grid1[page_no] || []} onPanelClick={handlePanelClick} />;
            case 'Panel3_Grid2': return <Grids1 images={panel3_grid2[page_no] || []} onPanelClick={handlePanelClick} />;
            case 'Panel3_Grid3': return <Grids2 images={panel3_grid3[page_no] || []} onPanelClick={handlePanelClick} />;
            case 'Panel4_Grid1': return <Grid images={panel4_grid1[page_no] || []} onPanelClick={handlePanelClick} />;
            case 'Panel4_Grid2': return <Grid1 images={panel4_grid2[page_no] || []} onPanelClick={handlePanelClick} />;
            case 'Panel4_Grid3': return <Grid2 images={panel4_grid3[page_no] || []} onPanelClick={handlePanelClick} />;
            case 'Panel4_Grid4': return <Grid3 images={panel4_grid4[page_no] || []} onPanelClick={handlePanelClick} />;
            default: defaults(panel);
        }
    };

    //Calling inference.py and handling images.
    const generateComic = async () => {
        const page_no = pageNo + 1;
        try {
            const res = await axios.post(API_ENDPOINTS.generateComic, { inferenceSteps2, guidanceScale2, seed2, page_no, artStyle, height_width });
            const images = res.data;
            if (panel === 'Panel4') {
                if (grid === 'Grid1') {
                    setpanel4_grid1(prev => ({ ...prev, [page_no]: images }));
                }
                else if (grid === 'Grid2') {
                    setpanel4_grid2(prev => ({ ...prev, [page_no]: images }));
                }
                else if (grid === 'Grid3') {
                    setpanel4_grid3(prev => ({ ...prev, [page_no]: images }));
                }
                else {
                    setpanel4_grid4(prev => ({ ...prev, [page_no]: images }));
                }
            }
            else if (panel === 'Panel3') {
                if (grid === 'Grid1') {
                    setpanel3_grid1(prev => ({ ...prev, [page_no]: images }));
                }
                else if (grid === 'Grid2') {
                    setpanel3_grid2(prev => ({ ...prev, [page_no]: images }));
                }
                else {
                    setpanel3_grid3(prev => ({ ...prev, [page_no]: images }));
                }
            }
            else if (panel === 'Panel2') {
                if (grid === 'Grid1') {
                    setpanel2_grid1(prev => ({ ...prev, [page_no]: images }));
                }
                else {
                    setpanel2_grid2(prev => ({ ...prev, [page_no]: images }));
                }
            }
            else if (panel === 'Panel1') {
                setpanel1_grid1(prev => ({ ...prev, [page_no]: images }));
            }
        } catch (error) {
            console.log(error)
        }
    }

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
                    onChange={e => {
                        SetactivePanel(e.target.value);
                        setPanelInfo(prev => {
                            const newPanelInfo = [...prev];
                            newPanelInfo[pageNo] = [PanelGridCount[panel], parseInt(e.target.value.split('_')[1].replace('Grid', ''))];
                            return newPanelInfo;
                        });

                    }}
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

                <select className="Font-box" value={artStyle} onChange={e => setArtStyle(e.target.value)}>
                    <option value="ANIME">ANIME</option>
                    <option value="MANGA">MANGA</option>
                </select>

                <select className='comic-theme'>
                    <option value="theme1">Default</option>
                    <option value="theme2">Serpia Colors</option>
                    <option value="theme3">Noir Colors</option>
                    <option value="theme4">Modern Colors</option>
                </select>

                <button className='generate-button' onClick={generateComic}>Generate Comic</button>

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
                    <FontAwesomeIcon icon={faArrowUp} />
                </button>

                <button className='navigate-page-btn'
                    onClick={() => pageNo != panelInfo.length - 1 ? setPageNo(pageNo + 1) : panelInfo.length - 1}
                    disabled={pageNo === panelInfo.length - 1}
                >
                    <FontAwesomeIcon icon={faArrowDown} />
                </button>
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
