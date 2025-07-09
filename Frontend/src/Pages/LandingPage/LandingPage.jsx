import React, { useEffect, useRef, useState } from "react";
import gsap from 'gsap';
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { windowlistner } from "../../Components/WindowListener/WindowListener";
import { color, motion } from "framer-motion";
import eye from "../../Picture/eye.jpg"
import aicomicx2 from "../../Picture/aicomic2.jpg"
import Epoch_Present from "../../Picture/Epoch_Present.png"
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

function Body() {
    const [position, setposition] = useState({ x: 0, y: 0 });
    const [backend, setbackend] = useState('');

    const navigate = useNavigate();

    windowlistner('pointermove', (e) => {
        setposition({ x: e.clientX, y: e.clientY })
    })

    useGSAP(() => {
        gsap.from(".summary", {
            x: -100,
            opacity: 0,
            delay: 1,
            duration: 1,
            scrollTrigger: ".summary"
        })
    })

    useGSAP(() => {
        let tl = gsap.from(".summarys", {
            x: -100,
            opacity: 0,
            delay: 1,
            duration: 1,
            scrollTrigger: ".summarys"
        })
    })

    useGSAP(() => {
        let tl = gsap.from(".summaryss", {
            x: -100,
            opacity: 0,
            delay: 1,
            duration: 1,
            scrollTrigger: ".summaryss"
        })
    })

    useGSAP(() => {
        gsap.from(".text", {
            y: 100,
            opacity: 0,
            delay: 0.5,
            duration: 0.75,
        })
    })

    useGSAP(() => {
        gsap.from(".efforts", {
            y: 100,
            opacity: 0,
            delay: 0.75,
            duration: 1,
        })
    })

    useGSAP(() => {
        gsap.from(".quote", {
            y: 100,
            opacity: 0,
            delay: 1,
            duration: 1.25,
        })
    })

    useGSAP(() => {
        gsap.from(".button", {
            y: 100,
            opacity: 0,
            delay: 1.25,
            duration: 1.75,
        })
    })

    useGSAP(() => {
        let tl = gsap.from(".privacy", {
            y: 100,
            opacity: 0,
            delay: 0.75,
            duration: 0.75,
            scrollTrigger: ".privacy"
        })
    })

    useGSAP(() => {
        let tl = gsap.from(".power", {
            x: -100,
            opacity: 0,
            delay: 1,
            duration: 1,
            scrollTrigger: ".power"
        })
    })

    useGSAP(() => {
        let tl = gsap.from(".streamline", {
            y: 200,
            opacity: 0,
            delay: 1,
            duration: 1,
            scrollTrigger: ".streamline"
        })
    })

    useGSAP(() => {
        let tl = gsap.from(".innovation", {
            x: 100,
            opacity: 0,
            delay: 1,
            duration: 1,
            scrollTrigger: ".innovation"
        })
    })

    const dive = () => {
        navigate('/user/Register')
    }

    return (
        <div style={styles.maindiv} className="!scroll-smooth">
            <div className="cursor" style={{
                ...styles.cursor,
                transform: `translate(${position.x}px, ${position.y}px)`
            }}></div>
            <div style={styles.bodyContainer}>
                <div style={styles.title} className="Title">
                    {/* <p className=" bg-white">{backend}</p> */}
                    <img style={styles.epoch} className="text" src={Epoch_Present}></img>

                </div>
                <div>
                    <img style={styles.image} className="efforts" src={aicomicx2}></img>
                </div>
            </div>
            <div style={styles.p} className="quote">
                <h1 style={styles.imagination}>WHERE INK BREATHES LIFE INTO HEROES.</h1>
                <p style={styles.quote}>UNLEASH YOUR CREATIVITY WITH AIComicX! AI-POWERED COMIC GENERATION TURNS YOUR IDEAS INTO STUNNING VISUAL STORIES!</p>
                <motion.button style={styles.button}
                    whileHover={{
                        scale: 1.04,
                        color: 'rgb(255, 255, 255)',
                        background: "linear-gradient(to right, rgba(215, 43, 89, .5), rgba(251, 232, 81, .5))",
                    }}
                    whileTap={{
                        scale: 1.01,
                    }}
                    className="button" onClick={dive}>DIVE IN</motion.button>
            </div>

        </div>
    )
}

const styles = {
    maindiv: {
        backgroundImage: `url(${eye})`,
        textAlign: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        height: '100vh',
        zIndex: "1",
        position: "relative",
    },

    title: {
        color: 'rgba(249, 245, 208, 0.86)',
        display: "inline-block"
    },
    imagination: {
        fontWeight: "900",
        fontSize: '45px',
        background: "linear-gradient(to right,rgb(223, 30, 114),rgb(230, 110, 41),rgb(255, 191, 0))",
        color: "transparent",
        backgroundClip: "text",
        display: "inline-block",
        fontStyle: "normal",
        fontDisplay: "swap",
        fontFamily: "'Michroma', sans-serif",
        marginTop: "20px"
    },
    p: {
        position: "relative",
        zIndex: "1000",
        bottom: "280px"
    },
    quote: {
        color: 'rgba(248, 245, 220, 0.91)',
        fontSize: '38px',
        fontFamily: "monospace,serif",
        fontWeight: '400',
        marginTop: "30px"
    },
    button: {
        fontFamily: "'Michroma', sans-serif",
        border: "2px solid #d72b59",
        background: "transparent",
        color: "white",
        backdropFilter: "blur(2px)",
        padding: '15px 55px',
        borderRadius: '30px',
        border: '2px solid red',
        marginBottom: "20px",
        marginTop: "50px"
    },
    image: {
        height: "600px", // Increased for better visibility
        width: "600px", // Maintain aspect ratio
        objectFit: "cover", // Ensures the image scales properly
        // boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)", // Adds a subtle shadow ,
        zIndex: "1",
        position: "relative",
        bottom: "80px"
    },
    epoch: {
        objectFit: "cover", // Ensures the image scales properly,
        position: "absolute",
        top: "8%",
        left: "38%",
        zIndex: "0",
        height: "150px",
        width: "400px"
    },
    cursor: {
        transition: "transform 0.18s ease",
        height: '60px',
        width: '60px',
        borderRadius: '50px',
        position: 'fixed',
        border: "1px solid white",
        pointerEvents: "none",
        left: -30,
        top: -30,
        zIndex: 9999,
        opacity: '0.9',
    }
}

export default Body;