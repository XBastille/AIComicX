import React from "react";

function Grid() {
    return (
        <div style={styles.container}>
            <div style={styles.inner}>
                <div style={styles.grid}>
                    <div style={styles.box}>1</div>
                    <div style={styles.box}>2</div>
                    <div style={styles.box}>3</div>
                    <div style={styles.box}>4</div>
                </div>
            </div>
        </div>
    )
}

const styles = {
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 260px)",  
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
        width: "260px",
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


export default Grid;
