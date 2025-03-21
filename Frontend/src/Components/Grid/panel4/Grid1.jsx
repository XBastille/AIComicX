import React from "react";
import "./Grid.css"
import { useState } from "react";

function Grid1() {

    const [zoom, setzoom] = useState(1);
    const gap = "6px"
    const boxHeight = zoom * 200
    const boxWidth = zoom * 300

    return (
        <div style={styles.flex}>
            <div style={styles.container}>
                <div style={styles.inner}>
                    <div style={{
                        ...styles.grid, width: `${zoom * 1000}`, gap: `${gap}px`, gridTemplateColumns: `repeat(2, ${boxWidth}px)`, gridTemplateRows: `repeat(3, ${boxHeight}px)`, maxWidth: "90vw",
                        maxHeight: "90vh",
                        overflow: "scroll",
                       
                    }} className="giids">
                        <div style={{ ...styles.box1, width: `${zoom * 300}px`, height: `${zoom * 200}` }}>1</div>
                        <div style={{ ...styles.box2, width: `${zoom * 300}px`, height: `${zoom * 200}` }}>2</div>
                        <div style={{ ...styles.box2, width: `${zoom * 300}px`, height: `${zoom * 200}` }}>3</div>
                        <div style={{ ...styles.box1, width: `${zoom * 300}px`, height: `${zoom * 200}` }}>4</div>
                    </div>
                </div>
            </div>
            <div>
                <input type="range"
                    min="1"
                    max="2"
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setzoom((e.target.value))}
                ></input>
            </div>
        </div>
    )
}

const styles = {
    grid: {
        display: "grid",
        ///  gridTemplateColumns: "repeat(2, 300px)",
        //  gridTemplateRows: "repeat(3, 200px)",
        // gap: "6px"
    },
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "black",
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
        //  width: "300px",
        height: "200px",
    },
    box2: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // width: "300px",
        height: "405px",  // Height adjusted for 2 rows
        backgroundColor: "rgb(31, 31, 31)",
        color: "white",
        fontSize: "20px",
        fontWeight: "bold",
        border: "1px solid white",
        gridRow: "span 2",  // Spans two rows
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

export default Grid1