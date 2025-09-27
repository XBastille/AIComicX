import React, { useState } from "react";
import "../panel4/Grid.css"

function Grids({ onPanelClick, images }) {

    const [zoom, setzoom] = useState(1);
    const gap = 7;
    const boxWidth = 630
    const boxHeight = 200

    return (
        <div style={styles.flex}>
            <div style={styles.container}>
                <div style={styles.inner}>
                    <div style={{
                        ...styles.grid, width: `${zoom * 630}px`, gap: `${gap}px`, gridTemplateColumns: `repeat(1, ${zoom * 630}px)`, gridTemplateRows: `repeat(3, ${zoom * boxHeight}px)`, maxWidth: "90vw",
                        maxHeight: "90vh",
                        overflow: "scroll",
                    }} className="grids">
                        <div style={{ ...styles.box, width: `${zoom * 630}px`, height: `${zoom * 200}px` }} onClick={() => onPanelClick?.(1)}>
                            <img src={images[0]} alt="Comic_Space_1" style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "fill",
                            }} />
                        </div>
                        <div style={{ ...styles.box, width: `${zoom * 420}px`, height: `${zoom * 200}px` }} onClick={() => onPanelClick?.(2)}>
                            <img src={images[1]} alt="Comic_Space_2" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>
                        <div style={{ ...styles.box, width: `${zoom * 630}px`, height: `${zoom * 200}px` }} onClick={() => onPanelClick?.(3)}>
                            <img src={images[2]} alt="Comic_Space_3" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="controller" style={styles.controller}>
                <input type="range"
                    min="1"
                    max="2"
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setzoom((e.target.value))}
                    className="color"
                ></input>
            </div>
        </div>
    )
}

const styles = {
    grid: {
        display: "grid",
        // gridTemplateColumns: "repeat(1, 630px)",
        // gridTemplateRows: "repeat(3, 200px)",
        // gap: "7px",
    },
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        color: "white",
    }, box: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // width: "630px",
        height: "200px",
        backgroundColor: "rgb(12, 12, 12)",
        color: "white",
        fontSize: "20px",
        fontWeight: "bold",
        border: "1px solid white",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
    },
    inner: {
        backgroundColor: "rgb(31, 31, 31)",
        padding: "8px",
        transition: "width 0.3s ease-in-out",
        overflow: 'auto'
    },
    flex: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        overflow: "auto"
    },
};

export default Grids