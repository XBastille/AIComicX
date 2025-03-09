import React from "react";
 
function Grid2(){
    return (
        <div style={styles.container}>
            <div style={styles.inner}>
                <div style={styles.grid}>
                    <div style={styles.box1}>1</div>
                    <div style={styles.box2}>2</div>
                    <div style={styles.box3}>3</div>
                    <div style={styles.box4}>4</div>
                </div>
            </div>
        </div>
    )
}

const styles = {
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 200px)",  // 3 equal columns
        gridTemplateRows: "repeat(2, 350px)",      // Auto-adjust height
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
        width: "100%",   // Ensures it spans correctly
        height: "350px", // Square shape
        gridColumn: "span 1",
        gridRow: "span 1", // Spanning 2 columns
    },
    box2: {  
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "200px",
        height: "350px",  // Shorter height
        backgroundColor: "rgb(31, 31, 31)",
        color: "white",
        fontSize: "20px",
        fontWeight: "bold",
        border: "1px solid white",
        gridColumn: "span 1",
        gridRow: "span 1",
    },
    box3: {  
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "250px",
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
        width: "405px",
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
    },
};

export default Grid2;
