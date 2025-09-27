import React, { useState } from "react";
import '../../../Pages/Conssole/Conssole.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCopy, faRotateRight, faEdit } from '@fortawesome/free-solid-svg-icons';
import { API_ENDPOINTS } from "../../../config/api";
import axios from 'axios';

export default function PanelEditor({ onClose, modalImage, selectedPanel, setPrompt, prompt, fontStyle, themeStyle, height_width, pageNo, regenerateComic }) {
    const [showEditControls, setShowEditControls] = useState(false);
    const [showCopyNotification, setShowCopyNotification] = useState(false);
    const [inferenceSteps2, setInferenceSteps2] = useState(40);
    const [guidanceScale2, setGuidanceScale2] = useState(7.5);
    const [seed2, setSeed2] = useState(9);
    const [panelNo, setPanelNo] = useState(0);
    // const [prompt, setPrompt] = useState("");

    const handleCopyPrompt = async () => {
        try {
            await navigator.clipboard.writeText(prompt);
            setShowCopyNotification(true);
            setTimeout(() => setShowCopyNotification(false), 2000);
        } catch (err) {
            console.error('Failed to copy prompt: ', err);
        }
    };

    const handleRegenerate = async () => {
        const page_no = pageNo + 1;
        await regenerateComic(
            {
                inferenceSteps2, guidanceScale2, seed2, prompt, fontStyle, themeStyle, height_width, page_no, selectedPanel 
            }
        );
        // const page_no = pageNo + 1;
        // console.log(prompt);
        // try {
        //     const res = await axios.post(API_ENDPOINTS.regenerateComic, { inferenceSteps2, guidanceScale2, seed2, prompt, fontStyle, themeStyle, height_width, page_no, selectedPanel });
        //     console.log(res.data);

        // } catch (error) {
        //     console.log(error);
        // }
    };

    const handleEditClick = () => {
        setShowEditControls(true);
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose} />
            <div className="panel-editor-modal">

                <button className="close-btn" onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <div className="panel-editor-content">
                    <div className='image_container'>
                        <img src={modalImage} />
                    </div>
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
                                <label>Inference Steps: {inferenceSteps2}</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={inferenceSteps2}
                                    onChange={(e) => setInferenceSteps2(parseInt(e.target.value))}
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
                                    value={guidanceScale2}
                                    onChange={(e) => setGuidanceScale2(parseFloat(e.target.value) || 0)}
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
                                    value={seed2}
                                    onChange={(e) => setSeed2(parseInt(e.target.value) || 0)}
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
    )
}