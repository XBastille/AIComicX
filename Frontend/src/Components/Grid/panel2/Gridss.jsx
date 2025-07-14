import React, { useState } from "react";
import "../panel4/Grid.css"
function Gridss({ onPanelClick }) {

    const [zoom, setzoom] = useState(1)
    const gap = 6
    const boxWidth = zoom * 470
    const boxHeight = zoom * 300
    return (
        <div style={styles.flex}>
            <div style={styles.container}>
                <div style={styles.inner}>
                    <div style={{
                        ...styles.grid, gap: `${gap}px`, gridTemplateColumns: `repeat(1, ${boxWidth}px)`, gridTemplateRows: `repeat(2, ${boxHeight}px)`, maxWidth: "90vw",
                        maxHeight: "90vh",
                        overflow: "scroll",
                    }} className="gidds">                        <div style={{ ...styles.box, width: `${zoom * 470}px`, height: `${zoom * 300}` }} onClick={() => onPanelClick?.(1)}>1</div>
                        <div style={{ ...styles.box, width: `${zoom * 470}px`, height: `${zoom * 300}` }} onClick={() => onPanelClick?.(2)}>2</div>
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
        gridTemplateColumns: "repeat(1, 470px)",  // Adjusted for better sizing
        gridTemplateRows: "repeat(2, 300px)",
        gap: "6px", // Reduced gap,
    },
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        color: "white",
    },
    box: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
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

export default Gridss;