import React, { useState } from "react";
import "../panel4/Grid.css"
function Grids2() {
    const [zoom, setzoom] = useState(1);
    const gap = 6;
    const boxWidth = zoom * 320;
    const boxHeight = zoom * 320


    return (
        <div style={styles.flex}>
            <div style={styles.container}>
                <div style={styles.inner}>
                    <div style={{
                        ...styles.grid, gap: `${gap}px`, gridTemplateColumns: `repeat(2, ${boxWidth}px)`, gridTemplateRows: `repeat(2, ${boxHeight}px)`, maxWidth: "90vw",
                        maxHeight: "90vh",
                        overflow: "scroll",
                    }} className="grids1">
                        <div style={{ ...styles.box1, width: `${zoom * 320}px`, height: `${zoom * 320}px` }}>1</div>
                        <div style={{ ...styles.box2, width: `${zoom * 320}px`, height: `${zoom * 320}px` }}>2</div>
                        <div style={{ ...styles.box4, width: `${zoom * 643}px`, height: `${zoom * 320}px` }}>3</div>
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
        gridTemplateColumns: "repeat(2, 320px)",
        gridTemplateRows: "repeat(2, 350px)",
        gap: "6px",
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
        width: "100%",
        height: "350px",
        // gridColumn: "span 1",
        // gridRow: "span 1",
    },
    box2: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "350px",
        backgroundColor: "rgb(31, 31, 31)",
        color: "white",
        fontSize: "20px",
        fontWeight: "bold",
        border: "1px solid white",
        // gridColumn: "span 1",
        // gridRow: "span 1",
    },
    box4: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "350px",  // Shorter height
        backgroundColor: "rgb(31, 31, 31)",
        color: "white",
        fontSize: "20px",
        fontWeight: "bold",
        border: "1px solid white",
        gridColumn: "span 2",
        gridRow: "span 1",
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

export default Grids2