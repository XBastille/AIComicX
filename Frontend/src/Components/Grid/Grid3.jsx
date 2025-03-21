import React from "react";

function Grid3(){
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
        gridTemplateColumns: "repeat(3, 200px)",  
        gridTemplateRows: "repeat(2, 350px)",   
        gap: "6px",
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
        width: "100%",   
        height: "350px", 
        gridColumn: "span 2", // Spanning 2 columns
    },
    box2: {  
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "200px",
        height: "350px",  
        backgroundColor: "rgb(31, 31, 31)",
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
export default Grid3;
