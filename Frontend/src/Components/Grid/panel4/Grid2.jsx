import React, { useState } from "react";
import "./Grid.css"

function Grid2() {

    const [zoom, setzoom] = useState(1);

    const gap = 6
    const boxWidth = zoom * 200
    const boxHeight = zoom * 350
    return (
        <div>
            <div style={styles.container}>
                <div style={styles.inner}>
                    <div style={{
                        ...styles.grid, width: `${zoom * 665}px`, gap: `${gap}px`, gridTemplateColumns: `repeat(3, ${boxWidth}px)`, gridTemplateRows: `repeat(2, ${boxHeight}px)`, maxWidth: "90vw",
                        maxHeight: "90vh",
                        overflow: "scroll",
                    }} className="giiids">
                        <div style={{ ...styles.box1, width: `${200 * zoom}px`, height: `${zoom * 350}px` }}>1</div>
                        <div style={{ ...styles.box2, width: `${zoom * 200}px`, height: `${zoom * 350}px` }}>2</div>
                        <div style={{ ...styles.box3, width: `${zoom * 250}px`, height: `${zoom * 703}px` }}>3</div>
                        <div style={{ ...styles.box4, width: `${zoom * 405}px`, height: `${zoom * 350}px` }}>4</div>
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
        //    gridTemplateColumns: "repeat(3, 200px)",  // 3 equal columns
        //   gridTemplateRows: "repeat(2, 350px)",      // Auto-adjust height
        //  gap: "6px",
    },
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "black",
        color: "white",
        overflow: "hidden",
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
        //  width: "100%",
        height: "350px",
        gridColumn: "span 1",
        gridRow: "span 1",
        overflow: "auto"
    },
    box2: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        //width: "200px",
        height: "350px",  // Shorter height
        backgroundColor: "rgb(31, 31, 31)",
        color: "white",
        fontSize: "20px",
        fontWeight: "bold",
        border: "1px solid white",
        gridColumn: "span 1",
        gridRow: "span 1",
        overflow: "auto"
    },
    box3: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // width: "250px",
        height: "100%",  // Shorter height
        backgroundColor: "rgb(31, 31, 31)",
        color: "white",
        fontSize: "20px",
        fontWeight: "bold",
        border: "1px solid white",
        gridColumn: "span 1",
        gridRow: "span 2",
        backgroundColor: "rgb(12, 12, 12)",
    },
    box4: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        //   width: "405px",
        height: "350px",  // Shorter height
        backgroundColor: "rgb(31, 31, 31)",
        color: "white",
        fontSize: "20px",
        fontWeight: "bold",
        border: "1px solid white",
        gridColumn: "span 2",
        gridRow: "span 1",
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

export default Grid2;
