import React, { useState } from "react";
import '../../../Pages/Conssole/Conssole.css'
export default function Settings({ onClose }) {
    const [inferenceSteps2, setInferenceSteps2] = useState(40);
    const [guidanceScale2, setGuidanceScale2] = useState(7.5);
    const [seed2, setSeed2] = useState(9);

    const handleResetDefaults = () => {
        setInferenceSteps2(40);
        setGuidanceScale2(7.5);
        setSeed2(9);
    };

    const handleApplySettings = () => {
        console.log("hello world")
    }

    return (
        <>
            <div className="modal-overlay" onClick={onClose} />
            <div className="about-modal">
                <button className="close-btn" onClick={onClose}>✖</button>
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
    )
}