import React from "react"
import '../../../Pages/Conssole/Conssole.css'

export default function About({onClose}) {
    return (
        <>
            <div className="modal-overlay" onClick={onClose} />
            <div className="about-modal">
                <button className="close-btn" onClick={onClose}>✖</button>
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
    )
}