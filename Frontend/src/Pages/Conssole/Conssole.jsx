import React, { act, useEffect, useState } from 'react';
import './Conssole.css';
import aicomicx2 from "../../Picture/aicomic2.jpg";
import SideNav from '../../Components/navigations/SideNav/SideNav';
import One from '../../Components/layouts/Grid/panel1/One';
import Gridss from '../../Components/layouts/Grid/panel2/Gridss';
import Gridss1 from '../../Components/layouts/Grid/panel2/Gridss1';
import Grids from '../../Components/layouts/Grid/panel3/Grids';
import Grids1 from '../../Components/layouts/Grid/panel3/Grids1';
import Grids2 from '../../Components/layouts/Grid/panel3/Grids2';
import Grid from '../../Components/layouts/Grid/panel4/Grid';
import Grid1 from '../../Components/layouts/Grid/panel4/Grid1';
import Grid2 from '../../Components/layouts/Grid/panel4/Grid2';
import Grid3 from '../../Components/layouts/Grid/panel4/Grid3';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { API_ENDPOINTS } from "../../config/api";
import { faCheck, faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import Settings from '../../Components/ui/setting/Settings';
import About from '../../Components/ui/about/About';
import PanelEditor from '../../Components/ui/PanelEditor/PanelEditor';
import useSideNav from '../../hooks/useSideNav';
import { PanelGridCount, Height_Width_data } from '../../config/panelConfig';


function Conssole() {
    const [showAbout, setShowAbout] = useState(false);
    const [activePanel, SetactivePanel] = useState('');
    const [panel, setpanel] = useState('');
    const [selectedPanel, setSelectedPanel] = useState(null);
    const [showPanelEditor, setShowPanelEditor] = useState(false);
    const [showEditControls, setShowEditControls] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [showCopyNotification, setShowCopyNotification] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [inferenceSteps2, setInferenceSteps2] = useState(40);
    const [guidanceScale2, setGuidanceScale2] = useState(7.5);
    const [seed2, setSeed2] = useState(9);
    const [panelInfo, setPanelInfo] = useState([]);
    const [pageNo, setPageNo] = useState(0);
    const [artStyle, setArtStyle] = useState('American(1950)');
    const [fontStyle, setFontStyle] = useState('Anime');
    const [themeStyle, setThemeStyle] = useState('Default');
    const [grid, setgrid] = useState("");
    const [height_width, setheight_width] = useState([]);
    const [modalImage, SetmodalImage] = useState("");

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

    const sideNav = useSideNav();

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


    const gridOptions = [];
    for (let i = 1; i <= (PanelGridCount[panel] || 1); i++) {
        gridOptions.push({
            value: `${panel}_Grid${i}`,
            label: `Grid${i}`,
        });
    }

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



    const handlePanelClick = (panelIndex) => {
        setSelectedPanel(panelIndex);
        setShowPanelEditor(true);
        setShowEditControls(false);
        get_panel_prompt(panelIndex);
        if (activePanel === 'Panel1_Grid1') {
            const images = panel1_grid1[6];
            SetmodalImage(images[panelIndex - 1])
        }
        else if (activePanel === 'Panel2_Grid1') {
            const images = panel2_grid1[1];
            console.log(images)
            SetmodalImage(images[panelIndex - 1])
        }
        else if (activePanel === 'Panel2_Grid2') {
            const images = panel2_grid2[1];
            SetmodalImage(images[panelIndex - 1])
        }
        else if (activePanel === 'Panel3_Grid1') {
            const images = panel3_grid1[1];
            SetmodalImage(images[panelIndex - 1])
        }
        else if (activePanel === 'Panel3_Grid2') {
            const images = panel3_grid2[1];
            SetmodalImage(images[panelIndex - 1])
        }
        else if (activePanel === 'Panel3_Grid3') {
            const images = panel3_grid3[1];
            SetmodalImage(images[panelIndex - 1])
        }
        else if (activePanel === 'Panel4_Grid1') {
            const images = panel4_grid1[1];
            SetmodalImage(images[panelIndex - 1])
        }
        else if (activePanel === 'Panel4_Grid2') {
            const images = panel4_grid2[1];
            SetmodalImage(images[panelIndex - 1])
        }
        else if (activePanel === 'Panel4_Grid3') {
            const images = panel4_grid3[1];
            SetmodalImage(images[panelIndex - 1])
        }
        else if (activePanel === 'Panel4_Grid4') {
            const images = panel4_grid4[1];
            SetmodalImage(images[panelIndex - 1])
        }
    };

    //get panel prompt 
    const get_panel_prompt = async (panelIndex) => {
        try {
            const res = await axios.post(API_ENDPOINTS.get_panel_prompt, { pageNo })
            const data = `panel_${panelIndex}`
            setPrompt(res.data.msg[data])

        } catch (error) {
            console.log(error);
        }
    }

    //Calling inference.py and handling images.
    const generateComic = async () => {
        const page_no = pageNo + 1;
        try {
            const res = await axios.post(API_ENDPOINTS.generateComic, { inferenceSteps2, guidanceScale2, seed2, page_no, artStyle, height_width, fontStyle, themeStyle });
            const images = res.data;
            get_panel_prompt();
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



    const regenerateComic = async (params) => {
        const page_no = pageNo + 1;
        console.log(params)
        try {
            const res = await axios.post(API_ENDPOINTS.regenerateComic, params)
            const images = res.data;
            console.log(panel)
            console.log(grid)
            console.log(selectedPanel)

            if (panel === 'Panel4') {
                if (grid === 'Grid1') {
                    setpanel4_grid1(prev => ({ ...prev, [page_no]: images }));
                    console.log(images[selectedPanel - 1])
                } else if (grid === 'Grid2') {
                    setpanel4_grid2(prev => ({ ...prev, [page_no]: images }));
                    console.log(images[selectedPanel - 1])
                } else if (grid === 'Grid3') {
                    setpanel4_grid3(prev => ({ ...prev, [page_no]: images }));
                    console.log(images[selectedPanel - 1])
                } else {
                    setpanel4_grid4(prev => ({ ...prev, [page_no]: images }));
                    console.log(images[selectedPanel - 1])
                }
            } else if (panel === 'Panel3') {
                if (grid === 'Grid1') {
                    setpanel3_grid1(prev => ({ ...prev, [page_no]: images }));
                    console.log(images[selectedPanel - 1])
                } else if (grid === 'Grid2') {
                    setpanel3_grid2(prev => ({ ...prev, [page_no]: images }));
                    console.log(images[selectedPanel - 1])
                } else {
                    setpanel3_grid3(prev => ({ ...prev, [page_no]: images }));
                    console.log(images[selectedPanel - 1])
                }
            } else if (panel === 'Panel2') {
                if (grid === 'Grid1') {
                    setpanel2_grid1(prev => ({ ...prev, [page_no]: images }));
                    console.log(images[selectedPanel - 1])
                } else {
                    setpanel2_grid2(prev => ({ ...prev, [page_no]: images }));
                    console.log(images[selectedPanel - 1])
                }
            } else if (panel === 'Panel1') {
                setpanel1_grid1(prev => ({ ...prev, [page_no]: images }));
                console.log(images[selectedPanel - 1])
            }

            // Update modal image so user sees the regenerated panel immediately
            SetmodalImage(images[selectedPanel - 1]);

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="Comic-container">
            <SideNav {...sideNav} />

            {showCopyNotification && (
                <div className="copy-notification">
                    <FontAwesomeIcon icon={faCheck} className="check-icon" />
                    Prompt copied to clipboard!
                </div>
            )}

            {/* structure of the page */}
            <div className="nav-bar">
                <select className='art-options' value={artStyle} onChange={e => setArtStyle(e.target.value)}>
                    <option value="American">American(1950)</option>
                    <option value="Japanese">Anime</option>
                    <option value="Humanoid">Manga</option>
                    <option value="Egyptian">European Ligne Claire</option>
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

                <select className="Font-box" value={fontStyle} onChange={(e) => setFontStyle(e.target.value)}>
                    <option value="anime">Anime</option>
                    <option value="manga">Manga</option>
                    <option value="comic">Comic</option>
                    <option value="handwritten">Handwritten</option>
                    <option value="cute">Cute</option>
                </select>

                <select className='comic-theme' value={themeStyle} onChange={(e) => setThemeStyle(e.target.value)}>
                    <option value="default">Default</option>
                    <option value="sepia">Serpia</option>
                    <option value="noir">Noir</option>
                    <option value="modern">Modern</option>
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
            {/* --------------------- */}

            {/* it is small section present in components/ui/... */}
            {showAbout && (
                <About onClose={() => setShowAbout(false)} />
            )}
            {showSettings && (
                <Settings onClose={() => setShowSettings(false)} />
            )}
            {showPanelEditor && (
                <PanelEditor onClose={() =>
                    setShowPanelEditor(false)}
                    selectedPanel={selectedPanel}
                    modalImage={modalImage}
                    prompt={prompt}
                    setPrompt={setPrompt}
                    pageNo={pageNo}
                    height_width={height_width}
                    fontStyle={fontStyle}
                    themeStyle={themeStyle}
                    regenerateComic={regenerateComic}

                />
            )}
        </div>
    );
}

export default Conssole;
