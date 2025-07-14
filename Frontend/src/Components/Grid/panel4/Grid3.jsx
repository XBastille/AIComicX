import React, { useState } from "react";
import "./Grid.css"

function Grid3({ onPanelClick }) {

    const [zoom, setzoom] = useState(1);
    const gap = 6
    const boxWidth = zoom * 200
    const boxHeight = zoom * 310

    return (
        <div style={styles.flex}>
            <div style={styles.container}>
                <div style={styles.inner}>
                    <div style={{
                        ...styles.grid, width: `${zoom * 615}px`, gap: `${gap}px`, gridTemplateColumns: `repeat(3, ${boxWidth}px)`, gridTemplateRows: `repeat(2, ${boxHeight}px)`, maxWidth: "90vw",
                        maxHeight: "90vh",
                        overflow: "scroll",
                    }} className="grid">                        <div style={{ ...styles.box1, width: `${zoom * 405}px`, height: `${zoom * 310}px` }} onClick={() => onPanelClick?.(1)}>1</div>
                        <div style={{ ...styles.box2, width: `${zoom * 200}px`, height: `${zoom * 310}px` }} onClick={() => onPanelClick?.(2)}>2</div>
                        <div style={{ ...styles.box2, width: `${zoom * 200}px`, height: `${zoom * 310}px` }} onClick={() => onPanelClick?.(3)}>3</div>
                        <div style={{ ...styles.box1, width: `${zoom * 405}px`, height: `${zoom * 310}px` }} onClick={() => onPanelClick?.(4)}>4</div>
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
        // gridTemplateColumns: "repeat(3, 200px)",  // 3 equal columns
        // gridTemplateRows: "repeat(2, 350px)",      // Auto-adjust height
        // gap: "6px",
    },
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        color: "white",
    },
    box1: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgb(12, 12, 12)",
        color: "white",
        fontSize: "20px",
        fontWeight: "bold",
        border: "1px solid white",
        // width: "100%",   // Ensures it spans correctly
        height: "310px", // Square shape
        gridColumn: "span 2", // Spanning 2 columns
        overflow: "auto"
    },
    box2: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        //  width: "200px",
        height: "310px",  // Shorter height
        backgroundColor: "rgb(31, 31, 31)",
        color: "white",
        fontSize: "20px",
        fontWeight: "bold",
        border: "1px solid white",
        overflow: "auto"
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
export default Grid3;