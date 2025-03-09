import React from "react";

function Grids1() {
    return (
        <div style={styles.container}>
            <div style={styles.inner}>
                <div style={styles.grid}>
                    <div style={styles.box}>1</div>
                    <div style={styles.box1}>2</div>
                    <div style={styles.box1}>3</div>
                </div>
            </div>
        </div>
    )
}

const styles = {
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 350px)",  // Adjusted for better sizing
        gridTemplateRows: "repeat(2, 340px)",
        gap: "6px", // Reduced gap,
        
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
        gridColumn: "span 1",
        gridRow: "span 2",
    },
    box1: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "340px",
        backgroundColor: "rgb(12, 12, 12)",
        color: "white",
        fontSize: "20px",
        fontWeight: "bold",
        border: "1px solid white",
    },
    inner: {
        backgroundColor: "rgb(31, 31, 31)",
        padding: "8px",
    },
};

export default Grids1