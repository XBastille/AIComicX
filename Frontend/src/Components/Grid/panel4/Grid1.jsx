import React from "react";

function Grid1(){
    return (
        <div style={styles.container}>
            <div style={styles.inner}>
                <div style={styles.grid}>
                    <div style={styles.box1}>1</div>
                    <div style={styles.box2}>2</div>
                    <div style={styles.box2}>3</div>
                    <div style={styles.box1}>4</div>
                </div>
            </div>
        </div>
    )
}

const styles = {
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 300px)",  // 2 Columns of 300px each
        gridTemplateRows: "repeat(3, 200px)",     // 3 Rows of 150px each
        gap: "6px", // Reduced gap
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
    box1:{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgb(12, 12, 12)",
        color: "white",
        fontSize: "20px",
        fontWeight: "bold",
        border: "1px solid white",
        width: "300px",
        height: "200px",
    },
    box2: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "300px",
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
    },
};

export default Grid1