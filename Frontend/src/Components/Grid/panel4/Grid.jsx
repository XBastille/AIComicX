import React, { useState } from "react";
import "./Grid.css";

function Grid() {
    const [zoom, setzoom] = useState(1);
    const gap = 6
    const boxWidth = zoom * 260;
    const boxHeight = zoom * 320;
    return (
        <div style={styles.flex}>
            <div style={{ ...styles.container }}>
                <div style={{ ...styles.inner }}>
                    <div style={{
                        ...styles.grid, width: `${zoom * 528}px`, gap: `${gap}px`, gridTemplateColumns: `repeat(2, ${boxWidth}px)`, gridTemplateRows: `repeat(2, ${boxHeight}px)`, maxWidth: "90vw",
                        maxHeight: "90vh",
                        overflow: "scroll",
                    }} className="gids">
                        <div style={{ ...styles.box, width: `${zoom * 260}px`, height: `${zoom * 320}` }}>1</div>
                        <div style={{ ...styles.box, width: `${zoom * 260}px`, height: `${zoom * 320}` }}>2</div>
                        <div style={{ ...styles.box, width: `${zoom * 260}px`, height: `${zoom * 320}` }}>3</div>
                        <div style={{ ...styles.box, width: `${zoom * 260}px`, height: `${zoom * 320}` }}>4</div>
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
        //  gridTemplateColumns: "repeat(2, 260px)",
        //  gridTemplateRows: "repeat(2, 340px)",
        //  transition: "width 0.3s ease-in-out",
    },
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        color: "white",
        overflow: "hidden",
    },
    box: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // width: "260px",
        height: "340px",
        backgroundColor: "rgb(12, 12, 12)",
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


export default Grid;