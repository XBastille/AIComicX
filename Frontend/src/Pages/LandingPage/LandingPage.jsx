import React, { useEffect, useRef, useState } from "react";
import gsap from 'gsap';
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { TextPlugin } from "gsap/TextPlugin"
import { windowlistner } from "../../Components/WindowListener/WindowListener";
import Summary from "../../Components/Summary/Summary"
import FeatureSection2 from "../../Components/FeatureSection2/FeatureSection2"
import ShowcaseSection from "../../Components/ShowcaseSection/ShowcaseSection"
import FAQ from "../../Components/FAQ/FAQ"
import Footer from "../../Components/Footer/Footer"
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Nav from "../../Components/Nav/Nav";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

function Body() {
    const [position, setposition] = useState({ x: 0, y: 0 });
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const headlineRef = useRef(null);
    const tickerRef = useRef(null);
    const welcomeBorderRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [pageLoadComplete, setPageLoadComplete] = useState(false);
    const [showBubbles, setShowBubbles] = useState(false);
    const [visibleBubbles, setVisibleBubbles] = useState({});
    const [videosReady, setVideosReady] = useState(false);
    const [loadedVideos, setLoadedVideos] = useState(0);

    const navigate = useNavigate();

    const speechBubbles = {
        0: [
            {
                x: 257,
                y: 3,
                text: "It only reveals itself when the two moons align.",
                tailDirection: "down",
                width: 130,
                height: 60,
                tailPosition: 25,
                tailRotation: 15,
                appearTime: 2,
                disappearTime: 6
            },
            {
                x: 50,
                y: 30,
                text: "Just like the inscription in the journal said...",
                tailDirection: "down",
                width: 130,
                height: 65,
                tailPosition: 75,
                tailRotation: -15,
                appearTime: 6,
                disappearTime: 10
            }
        ],
        1: [
            {
                x: 270,
                y: 2,
                text: "For Valoria, we must fight!",
                tailDirection: "None",
                width: 160,
                height: 90,
                tailPosition: 50,
                tailRotation: 0,
                appearTime: 2,
                disappearTime: 10
            }
        ],
        2: [
            {
                x: 470,
                y: 90,
                text: "So you're really leaving, then?",
                tailDirection: "left",
                width: 110,
                height: 55,
                tailPosition: 0,
                tailRotation: -5,
                appearTime: 2,
                disappearTime: 6
            },
            {
                x: 120,
                y: 290,
                text: "I have to. But I'll come back for this.",
                tailDirection: "up",
                width: 120,
                height: 60,
                tailPosition: 55,
                tailRotation: 8,
                appearTime: 6,
                disappearTime: 10
            }
        ],
        3: [
            {
                x: 435,
                y: 95,
                text: "Such perfect, flowing data... It's like watching a soul.",
                tailDirection: "down",
                width: 140,
                height: 70,
                tailPosition: 50,
                tailRotation: 0,
                appearTime: 2,
                disappearTime: 10
            }
        ]
    };

    const animatedWords = [
        { text: "EPIC", font: "'Nosifer', serif" }, // Horror/creepy
        { text: "BOLD", font: "'Chela One', sans-serif" }, // Chunky cartoon
        { text: "WILD", font: "'Kalam', cursive" }, // Hand-drawn casual
        { text: "MAGIC", font: "'Griffy', serif" }, // Medieval/fantasy
        { text: "DARK", font: "'Lacquer', sans-serif" }, // Asian brush style
        { text: "BRIGHT", font: "'Butcherman', serif" }, // Western/horror
        { text: "VIVID", font: "'Shrikhand', cursive" }, // Indian/decorative
        { text: "DYNAMIC", font: "'Pirata One', cursive" }, // Pirate/adventure
        { text: "FIERCE", font: "'Caesar Dressing', cursive" } // Graffiti style
    ];

    windowlistner('pointermove', (e) => {
        setposition({ x: e.clientX, y: e.clientY })
    });

    useGSAP(() => {
        const headline = headlineRef.current;
        if (!headline) return;

        const originalText = "DIVE IN";
        const letters = originalText.split('');
        headline.innerHTML = letters.map(letter =>
            `<span class="letter">${letter}</span>`
        ).join('');

        const letterSpans = headline.querySelectorAll('.letter');
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

        gsap.set(letterSpans, { opacity: 1 });

        letterSpans.forEach((span, index) => {
            const originalLetter = span.textContent;
            let scrambleCount = 0;
            const maxScrambles = 7;

            setTimeout(() => {
                const scrambleInterval = setInterval(() => {
                    if (scrambleCount < maxScrambles) {
                        span.textContent = chars[Math.floor(Math.random() * chars.length)];
                        scrambleCount++;
                    } else {
                        clearInterval(scrambleInterval);
                        setTimeout(() => {
                            span.textContent = originalLetter;
                        }, 50);
                    }
                }, 45);
            }, index * 100);
        });
    }, []);

    useGSAP(() => {
        const mottoText = "Dreams Become Visual Stories Here";
        const mottoContainer = document.querySelector('.motto-text');
        if (!mottoContainer) return;

        mottoContainer.innerHTML = mottoText.split('').map(letter =>
            `<span class="motto-letter" style="display: block; line-height: 0.9; font-size: 1.0rem; font-family: 'anime', sans-serif; font-weight: 500;">${letter === ' ' ? '\u00A0' : letter}</span>`
        ).join('');

        const mottoLetters = document.querySelectorAll('.motto-letter');
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

        mottoLetters.forEach((span, index) => {
            const originalLetter = span.textContent;
            let scrambleCount = 0;
            const maxScrambles = 12;

            setTimeout(() => {
                const scrambleInterval = setInterval(() => {
                    if (scrambleCount < maxScrambles) {
                        span.textContent = chars[Math.floor(Math.random() * chars.length)];
                        scrambleCount++;
                    } else {
                        clearInterval(scrambleInterval);
                        span.textContent = originalLetter;
                    }
                }, 70);
            }, index * 25);
        });
    }, []);

    useGSAP(() => {
        const tl = gsap.timeline({ repeat: -1 });

        animatedWords.forEach((wordObj, index) => {
            tl.to(tickerRef.current, {
                duration: 0.02,
                opacity: 0,
                ease: "power2.inOut"
            })
                .call(() => {
                    if (tickerRef.current) {
                        const letters = wordObj.text.split('');
                        tickerRef.current.innerHTML = letters.map(letter =>
                            `<span style="display: block; line-height: 1.2; font-family: ${wordObj.font};">${letter}</span>`
                        ).join('');
                    }
                })
                .to(tickerRef.current, {
                    duration: 0.02,
                    opacity: 1,
                    ease: "power2.inOut"
                })
                .to({}, { duration: 0.08 });
        });
    }, []);

    useGSAP(() => {
        gsap.from(".creative-text", {
            x: -50,
            opacity: 0,
            duration: 1.2,
            delay: 0.2,
            ease: "power2.out"
        });

        gsap.from(".motto-text", {
            x: 50,
            opacity: 0,
            duration: 1.2,
            delay: 0.2,
            ease: "power2.out"
        });

        gsap.from(".welcome-text", {
            scale: 0.5,
            opacity: 0,
            duration: 1.5,
            delay: 0.1,
            ease: "back.out(1.7)"
        });

        gsap.from(".dive-in-button", {
            scale: 0.5,
            opacity: 0,
            duration: 1.5,
            delay: 0.1,
            ease: "back.out(1.7)"
        });
    }, []);

    useGSAP(() => {
        if (!pageLoadComplete) return;

        const hero = document.querySelector('.hero-container');
        const selectors = [".dive-in-button", ".creative-text", ".motto-text"];

        const getTransformFor = (selector) => {
            if (selector === '.creative-text' || selector === '.motto-text') return 'translateY(-50%)';
            return 'none';
        };

        const freeze = (selector) => {
            const el = document.querySelector(selector);
            if (!el || !hero) return;
            const rect = el.getBoundingClientRect();
            const heroRect = hero.getBoundingClientRect();
            const topAbs = rect.top - heroRect.top;
            const leftAbs = rect.left - heroRect.left;
            gsap.set(el, {
                position: 'absolute',
                top: topAbs,
                left: leftAbs,
                right: 'auto',
                bottom: 'auto',
                width: rect.width,
                transform: 'none'
            });
        };

        const stick = (selector) => {
            const el = document.querySelector(selector);
            if (!el) return;
            if (selector === '.dive-in-button') {
                gsap.set(el, {
                    position: 'fixed',
                    bottom: '4%',
                    right: '4%',
                    left: 'auto',
                    top: 'auto',
                    width: '',
                    transform: 'none'
                });
            } else if (selector === '.creative-text') {
                gsap.set(el, {
                    position: 'fixed',
                    left: '30px',
                    top: '70%',
                    right: 'auto',
                    bottom: 'auto',
                    width: '',
                    transform: 'translateY(-50%)'
                });
            } else if (selector === '.motto-text') {
                gsap.set(el, {
                    position: 'fixed',
                    right: '45px',
                    top: '50%',
                    left: 'auto',
                    bottom: 'auto',
                    width: '',
                    transform: 'translateY(-50%)'
                });
            } else {
                gsap.set(el, {
                    position: 'fixed',
                    top: '',
                    left: '',
                    right: '',
                    bottom: '',
                    width: '',
                    transform: getTransformFor(selector)
                });
            }
        };

        const freezeAll = () => selectors.forEach(freeze);
        const stickAll = () => selectors.forEach(stick);

        stickAll();

        ScrollTrigger.create({
            trigger: '.purple-section',
            start: 'top bottom',
            end: 'bottom top',
            onEnter: freezeAll,
            onEnterBack: freezeAll,
            onLeaveBack: stickAll
        });

    }, [pageLoadComplete]);

    const handleVideoReady = () => {
        setLoadedVideos(prev => {
            const newCount = prev + 1;
            if (newCount >= 4) {
                setVideosReady(true);
            }
            return newCount;
        });
    };

    useGSAP(() => {
        if (!videosReady) return;

        setShowBubbles(false);
        setTimeout(() => {
            setShowBubbles(true);
            startBubbleTimings();
        }, 100);
    }, [videosReady]);

    const startBubbleTimings = () => {
        const runCycle = () => {
            setVisibleBubbles({});

            Object.keys(speechBubbles).forEach(panelIndex => {
                speechBubbles[panelIndex].forEach((bubble, bubbleIndex) => {
                    const bubbleKey = `${panelIndex}-${bubbleIndex}`;

                    setTimeout(() => {
                        setVisibleBubbles(prev => ({ ...prev, [bubbleKey]: true }));
                    }, bubble.appearTime * 1000);

                    setTimeout(() => {
                        setVisibleBubbles(prev => ({ ...prev, [bubbleKey]: false }));
                    }, bubble.disappearTime * 1000);
                });
            });
        };

        runCycle();

        setInterval(runCycle, 10000);
    };

    useGSAP(() => {
        if (!welcomeBorderRef.current || pageLoadComplete) return;

        const borderContainer = welcomeBorderRef.current;
        const travelNode1 = borderContainer.querySelector('.travel-node-1');
        const travelNode2 = borderContainer.querySelector('.travel-node-2');
        const drawPath1 = borderContainer.querySelector('.draw-path-1');
        const drawPath2 = borderContainer.querySelector('.draw-path-2');
        const expandBorder = borderContainer.querySelector('.expand-border');
        const cornerTopLeft = borderContainer.querySelector('.corner-top-left');
        const cornerBottomRight = borderContainer.querySelector('.corner-bottom-right');

        const hoverEdges = borderContainer.querySelector('.hover-edges');
        const edgeTop = borderContainer.querySelector('.edge-top');
        const edgeLeft = borderContainer.querySelector('.edge-left');
        const edgeBottom = borderContainer.querySelector('.edge-bottom');
        const edgeRight = borderContainer.querySelector('.edge-right');
        const cornerTopRight = borderContainer.querySelector('.corner-top-right');
        const cornerBottomLeft = borderContainer.querySelector('.corner-bottom-left');

        gsap.set([travelNode1, travelNode2, drawPath1, drawPath2, expandBorder, cornerTopLeft, cornerBottomRight, hoverEdges], { opacity: 0 });
        gsap.set([drawPath1, drawPath2], { strokeDasharray: "2250 2250", strokeDashoffset: 2250 });
        gsap.set(expandBorder, { strokeDasharray: "0 2250", strokeDashoffset: 0 });

        const tl = gsap.timeline({
            delay: 1,
            onComplete: () => setPageLoadComplete(true)
        });

        tl.set([travelNode1, travelNode2, drawPath1, drawPath2], { opacity: 1 })

            .to([drawPath1, drawPath2], {
                strokeDashoffset: 0,
                duration: 2,
                ease: "none"
            }, 0)

            .to(travelNode1, {
                x: 467,
                duration: 0.5,
                ease: "none"
            }, 0)
            .to(travelNode1, {
                y: 140,
                duration: 0.5,
                ease: "none"
            }, 0.5)
            .to(travelNode1, {
                x: 0,
                duration: 0.5,
                ease: "none"
            }, 1.0)
            .to(travelNode1, {
                y: 0,
                duration: 0.5,
                ease: "none"
            }, 1.5)

            .to(travelNode2, {
                x: -467,
                duration: 0.5,
                ease: "none"
            }, 0)
            .to(travelNode2, {
                y: -140,
                duration: 0.5,
                ease: "none"
            }, 0.5)
            .to(travelNode2, {
                x: 0,
                duration: 0.5,
                ease: "none"
            }, 1.0)
            .to(travelNode2, {
                y: 0,
                duration: 0.5,
                ease: "none"
            }, 1.5)

            .set([travelNode1, travelNode2], { opacity: 0 })
            .set(expandBorder, { opacity: 1 })
            .fromTo(expandBorder, {
                strokeDasharray: "0 2250",
                strokeDashoffset: 0
            }, {
                strokeDasharray: "2250 2250",
                duration: 1.0,
                ease: "power2.out"
            })

            .set([drawPath1, drawPath2, expandBorder], { opacity: 0 })
            .set([cornerTopLeft, cornerBottomRight], { opacity: 1 })
            .set(hoverEdges, { opacity: 1 })
            .set([edgeTop, edgeBottom], { strokeDashoffset: 0 })
            .set([edgeLeft, edgeRight], { strokeDashoffset: 0 })
            .set([cornerTopRight, cornerBottomLeft], { strokeDashoffset: 0 })
            .to([edgeTop, edgeBottom], {
                strokeDashoffset: 407,
                duration: 0.6,
                ease: "power2.in"
            })
            .to([edgeLeft, edgeRight], {
                strokeDashoffset: 80,
                duration: 0.6,
                ease: "power2.in"
            }, "<")
            .to([cornerTopRight, cornerBottomLeft], {
                strokeDashoffset: 16,
                duration: 0.3,
                ease: "power2.in"
            }, "<")
            .set(hoverEdges, { opacity: 0 });

    }, [pageLoadComplete]);

    useGSAP(() => {
        if (!welcomeBorderRef.current || !pageLoadComplete) return;

        const borderContainer = welcomeBorderRef.current;
        const hoverEdges = borderContainer.querySelector('.hover-edges');
        const edgeTop = borderContainer.querySelector('.edge-top');
        const edgeLeft = borderContainer.querySelector('.edge-left');
        const edgeBottom = borderContainer.querySelector('.edge-bottom');
        const edgeRight = borderContainer.querySelector('.edge-right');
        const cornerTopRight = borderContainer.querySelector('.corner-top-right');
        const cornerBottomLeft = borderContainer.querySelector('.corner-bottom-left');
        const buttonContainer = document.querySelector('.dive-in-button');
        const letterSpans = headlineRef.current?.querySelectorAll('.letter');

        if (isHovered) {
            gsap.set(hoverEdges, { opacity: 1 });

            gsap.set([edgeTop, edgeBottom], { strokeDashoffset: 407 });
            gsap.set([edgeLeft, edgeRight], { strokeDashoffset: 80 });
            gsap.set([cornerTopRight, cornerBottomLeft], { strokeDashoffset: 16 });

            const tl = gsap.timeline();

            tl.to(buttonContainer, {
                y: -15,
                duration: 0.4,
                ease: "power2.out"
            }, 0)

                .to([edgeTop, edgeBottom], {
                    strokeDashoffset: 0,
                    duration: 0.8,
                    ease: "power2.out"
                }, 0)
                .to([edgeLeft, edgeRight], {
                    strokeDashoffset: 0,
                    duration: 0.4,
                    ease: "power2.out"
                }, 0)
                .to([cornerTopRight, cornerBottomLeft], {
                    strokeDashoffset: 0,
                    duration: 0.3,
                    ease: "power2.out"
                }, 0.5);

            if (letterSpans) {
                letterSpans.forEach((span, index) => {
                    gsap.to(span, {
                        opacity: 0.1,
                        duration: 0.12,
                        repeat: 5,
                        yoyo: true,
                        delay: index * 0.08,
                        ease: "power2.inOut"
                    });
                });
            }

        } else {
            const tl = gsap.timeline({
                onComplete: () => {
                    gsap.set(hoverEdges, { opacity: 0 });
                }
            });

            tl.to(buttonContainer, {
                y: 0,
                duration: 0.6,
                ease: "power2.inOut"
            }, 0)

                .to([edgeTop, edgeBottom], {
                    strokeDashoffset: 407,
                    duration: 0.6,
                    ease: "power2.in"
                }, 0)
                .to([edgeLeft, edgeRight], {
                    strokeDashoffset: 80,
                    duration: 0.6,
                    ease: "power2.in"
                }, 0)
                .to([cornerTopRight, cornerBottomLeft], {
                    strokeDashoffset: 16,
                    duration: 0.3,
                    ease: "power2.in"
                }, 0);

            if (letterSpans) {
                gsap.set(letterSpans, { opacity: 1 });
            }
        }
    }, [isHovered, pageLoadComplete]);

    const handleDiveInClick = () => {
        navigate('/user/Register');
    }; import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

    return (
        <div style={styles.maindiv} className="!scroll-smooth">
            <Nav />
            <div className="cursor" style={{
                ...styles.cursor,
                transform: `translate(${position.x}px, ${position.y}px)`
            }}></div>

            <div style={styles.heroContainer} className="hero-container">

                <div style={styles.gridContainer}>

                    <div style={styles.gridItem}>
                        <video
                            style={styles.gridVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                            onCanPlay={handleVideoReady}
                        >
                            <source src="./src/Picture/land3.mp4" type="video/mp4" />
                        </video>

                        {showBubbles && speechBubbles[0] && speechBubbles[0].map((bubble, index) => {
                            const bubbleKey = `0-${index}`;
                            const isVisible = visibleBubbles[bubbleKey];
                            return (
                                <div
                                    key={index}
                                    className={`speech-bubble ${isVisible ? 'animate-in' : 'animate-out'}`}
                                    style={{
                                        position: 'absolute',
                                        left: `${bubble.x}px`,
                                        top: `${bubble.y}px`,
                                        transform: bubble.tailDirection === "up"
                                            ? 'translate(-50%, -100%)'
                                            : 'translate(-50%, -120%)',
                                        opacity: isVisible ? 1 : 0,
                                        zIndex: 20
                                    }}
                                >
                                    <div
                                        className="speech-bubble-content"
                                        style={{
                                            width: `${bubble.width}px`,
                                            height: `${bubble.height}px`
                                        }}
                                    >
                                        {bubble.text}
                                    </div>
                                    <div
                                        className={`speech-bubble-tail-${bubble.tailDirection}`}
                                        style={{
                                            left: `${bubble.tailPosition}%`,
                                            transform: `translateX(-50%) rotate(${bubble.tailRotation}deg)`
                                        }}
                                    ></div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={styles.gridItem}>
                        <video
                            style={styles.gridVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                            onCanPlay={handleVideoReady}
                        >
                            <source src="./src/Picture/land.mp4" type="video/mp4" />
                        </video>

                        {showBubbles && speechBubbles[1] && speechBubbles[1].map((bubble, index) => {
                            const bubbleKey = `1-${index}`;
                            const isVisible = visibleBubbles[bubbleKey];
                            return (
                                <div
                                    key={index}
                                    className={`speech-bubble ${isVisible ? 'animate-in' : 'animate-out'}`}
                                    style={{
                                        position: 'absolute',
                                        left: `${bubble.x}px`,
                                        top: `${bubble.y}px`,
                                        transform: bubble.tailDirection === "up"
                                            ? 'translate(-50%, -100%)'
                                            : 'translate(-50%, -120%)',
                                        opacity: isVisible ? 1 : 0,
                                        zIndex: 20
                                    }}
                                >
                                    <div
                                        className={`speech-bubble-content ${bubble.text.includes('Valoria') ? 'valoria-shout' : ''}`}
                                        style={{
                                            width: `${bubble.width}px`,
                                            height: `${bubble.height}px`
                                        }}
                                    >
                                        {bubble.text}
                                    </div>
                                    <div
                                        className={`speech-bubble-tail-${bubble.tailDirection}`}
                                        style={{
                                            left: `${bubble.tailPosition}%`,
                                            transform: `translateX(-50%) rotate(${bubble.tailRotation}deg)`
                                        }}
                                    ></div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={styles.gridItem}>
                        <video
                            style={styles.gridVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                            onCanPlay={handleVideoReady}
                        >
                            <source src="./src/Picture/land4.mp4" type="video/mp4" />
                        </video>

                        {showBubbles && speechBubbles[2] && speechBubbles[2].map((bubble, index) => {
                            const bubbleKey = `2-${index}`;
                            const isVisible = visibleBubbles[bubbleKey];
                            return (
                                <div
                                    key={index}
                                    className={`speech-bubble ${isVisible ? 'animate-in' : 'animate-out'}`}
                                    style={{
                                        position: 'absolute',
                                        left: `${bubble.x}px`,
                                        top: `${bubble.y}px`,
                                        transform: bubble.tailDirection === "up"
                                            ? 'translate(-50%, -100%)'
                                            : bubble.tailDirection === "left"
                                                ? 'translate(-100%, -50%)'
                                                : 'translate(-50%, -120%)',
                                        opacity: isVisible ? 1 : 0,
                                        zIndex: 20
                                    }}
                                >
                                    <div
                                        className="speech-bubble-content"
                                        style={{
                                            width: `${bubble.width}px`,
                                            height: `${bubble.height}px`
                                        }}
                                    >
                                        {bubble.text}
                                    </div>
                                    <div
                                        className={`speech-bubble-tail-${bubble.tailDirection}`}
                                        style={{
                                            left: `${bubble.tailPosition}%`,
                                            transform: `translateX(-50%) rotate(${bubble.tailRotation}deg)`
                                        }}
                                    ></div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={styles.gridItem}>
                        <video
                            style={styles.gridVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                            onCanPlay={handleVideoReady}
                        >
                            <source src="./src/Picture/land2.mp4" type="video/mp4" />
                        </video>

                        {showBubbles && speechBubbles[3] && speechBubbles[3].map((bubble, index) => {
                            const bubbleKey = `3-${index}`;
                            const isVisible = visibleBubbles[bubbleKey];
                            return (
                                <div
                                    key={index}
                                    className={`speech-bubble ${isVisible ? 'animate-in' : 'animate-out'}`}
                                    style={{
                                        position: 'absolute',
                                        left: `${bubble.x}px`,
                                        top: `${bubble.y}px`,
                                        transform: bubble.tailDirection === "up"
                                            ? 'translate(-50%, -100%)'
                                            : 'translate(-50%, -120%)',
                                        opacity: isVisible ? 1 : 0,
                                        zIndex: 20
                                    }}
                                >
                                    <div
                                        className="speech-bubble-content"
                                        style={{
                                            width: `${bubble.width}px`,
                                            height: `${bubble.height}px`
                                        }}
                                    >
                                        {bubble.text}
                                    </div>
                                    <div
                                        className={`speech-bubble-tail-${bubble.tailDirection}`}
                                        style={{
                                            left: `${bubble.tailPosition}%`,
                                            transform: `translateX(-50%) rotate(${bubble.tailRotation}deg)`
                                        }}
                                    ></div>
                                </div>
                            );
                        })}
                    </div>
                </div>


                <button
                    style={styles.diveInButton}
                    className="dive-in-button"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={handleDiveInClick}
                >
                    <h1 ref={headlineRef} style={styles.buttonText}>
                        DIVE IN
                    </h1>

                    <svg
                        ref={welcomeBorderRef}
                        style={styles.borderSvg}
                        viewBox="0 0 500 200"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle
                            className="travel-node-1"
                            cx="13" cy="30"
                            r="6"
                            fill="white"
                            filter="url(#glow)"
                        />

                        <circle
                            className="travel-node-2"
                            cx="480" cy="170"
                            r="6"
                            fill="white"
                            filter="url(#glow)"
                        />

                        <path
                            className="draw-path-1"
                            d="M13 30 L470 30 Q480 30 480 40 L480 160 Q480 170 470 170 L23 170 Q13 170 13 160 L13 40 Q13 30 23 30"
                            stroke="white"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray="2250 2250"
                            strokeDashoffset="2250"
                        />

                        <path
                            className="draw-path-2"
                            d="M480 170 L23 170 Q13 170 13 160 L13 40 Q13 30 23 30 L470 30 Q480 30 480 40 L480 160 Q480 170 470 170"
                            stroke="white"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray="2250 2250"
                            strokeDashoffset="2250"
                        />

                        <rect
                            className="expand-border"
                            x="13" y="30"
                            width="467" height="140"
                            stroke="white"
                            strokeWidth="6"
                            fill="none"
                            rx="10"
                            strokeDasharray="0 2250"
                        />

                        <g className="corner-top-left">
                            <line
                                x1="25" y1="30"
                                x2="63" y2="30"
                                stroke="white"
                                strokeWidth="6"
                                strokeLinecap="round"
                            />
                            <line
                                x1="13" y1="42"
                                x2="13" y2="80"
                                stroke="white"
                                strokeWidth="6"
                                strokeLinecap="round"
                            />
                            <path
                                d="M13 42 A12 12 0 0 1 25 30"
                                stroke="white"
                                strokeWidth="6"
                                strokeLinecap="round"
                                fill="none"
                            />
                        </g>

                        <g className="corner-bottom-right">
                            <line
                                x1="430" y1="170"
                                x2="468" y2="170"
                                stroke="white"
                                strokeWidth="6"
                                strokeLinecap="round"
                            />
                            <line
                                x1="480" y1="120"
                                x2="480" y2="158"
                                stroke="white"
                                strokeWidth="6"
                                strokeLinecap="round"
                            />
                            <path
                                d="M468 170 A12 12 0 0 0 480 158"
                                stroke="white"
                                strokeWidth="6"
                                strokeLinecap="round"
                                fill="none"
                            />
                        </g>

                        <g className="hover-edges">
                            <line
                                className="edge-top"
                                x1="63" y1="30"
                                x2="470" y2="30"
                                stroke="white"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray="407 407"
                                strokeDashoffset="407"
                            />

                            <line
                                className="edge-left"
                                x1="13" y1="80"
                                x2="13" y2="160"
                                stroke="white"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray="80 80"
                                strokeDashoffset="80"
                            />

                            <line
                                className="edge-bottom"
                                x1="430" y1="170"
                                x2="23" y2="170"
                                stroke="white"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray="407 407"
                                strokeDashoffset="407"
                            />

                            <line
                                className="edge-right"
                                x1="480" y1="120"
                                x2="480" y2="40"
                                stroke="white"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray="80 80"
                                strokeDashoffset="80"
                            />

                            <path
                                className="corner-top-right"
                                d="M470 30 Q480 30 480 40"
                                stroke="white"
                                strokeWidth="6"
                                strokeLinecap="round"
                                fill="none"
                                strokeDasharray="16 16"
                                strokeDashoffset="16"
                            />

                            <path
                                className="corner-bottom-left"
                                d="M13 160 Q13 170 23 170"
                                stroke="white"
                                strokeWidth="6"
                                strokeLinecap="round"
                                fill="none"
                                strokeDasharray="16 16"
                                strokeDashoffset="16"
                            />
                        </g>

                        <defs>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                    </svg>
                </button>

                <div style={styles.creativeContainer} className="creative-text">
                    <div style={styles.creativeText}>
                        <div style={styles.creativeStatic}>
                            {'STORY IS '.split('').map((letter, index) => (
                                <span key={index} style={styles.verticalLetter}>
                                    {letter === ' ' ? '\u00A0' : letter}
                                </span>
                            ))}
                        </div>
                        <div style={styles.animatedWordBox}>
                            <div ref={tickerRef} style={styles.creativeAnimated}>
                                {'EPIC'.split('').map((letter, index) => (
                                    <span key={index} style={styles.verticalLetter}>
                                        {letter}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.mottoContainer} className="motto-text">
                </div>
            </div>

            <div style={styles.purpleSection} className="purple-section">
                <Summary />
                <FeatureSection2 />
                <ShowcaseSection />
                <FAQ />
                <Footer />
            </div>
        </div>
    )
}

const styles = {
    maindiv: {
        backgroundColor: '#0a0a0a',
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        width: '100vw',
        zIndex: "1",
        position: "relative",
        overflowX: 'hidden'
    },

    heroContainer: {
        position: 'relative',
        width: '100%',
        height: '100vh',
        paddingTop: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom, #0a0a0a 50%, #1a0f1f 80%, rgb(31, 22, 35) 95%)'
    },

    uShapeGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
            conic-gradient(from 180deg at 15% 50%, rgba(31, 22, 35, 0.9) 0deg, rgba(31, 22, 35, 0.5) 45deg, transparent 90deg, transparent 270deg, rgba(31, 22, 35, 0.5) 315deg, rgba(31, 22, 35, 0.9) 360deg),
            conic-gradient(from 0deg at 85% 50%, rgba(31, 22, 35, 0.9) 0deg, rgba(31, 22, 35, 0.5) 45deg, transparent 90deg, transparent 270deg, rgba(31, 22, 35, 0.5) 315deg, rgba(31, 22, 35, 0.9) 360deg),
            linear-gradient(to top, rgba(31, 22, 35, 0.95) 0%, rgba(31, 22, 35, 0.6) 25%, rgba(31, 22, 35, 0.2) 45%, transparent 65%)
        `,
        pointerEvents: 'none',
        zIndex: 1
    },

    gridContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '12px',
        width: '1344px',
        height: '768px',
        position: 'absolute',
        top: '67%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2
    },

    gridItem: {
        backgroundColor: 'rgba(15, 15, 15, 0.8)',
        border: '1px solid rgba(223, 30, 114, 0.3)',
        borderRadius: '8px',
        boxShadow: 'inset 0 0 20px rgba(223, 30, 114, 0.1)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
    },

    gridVideo: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '8px',
        opacity: 0.8
    },

    diveInButton: {
        position: 'absolute',
        bottom: '4%',
        right: '4%',
        zIndex: 1000,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '25px 40px',
        borderRadius: '16px',
        transition: 'all 0.3s ease',
        overflow: 'hidden'
    },

    buttonText: {
        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
        fontWeight: '900',
        fontFamily: "'Inter', sans-serif",
        color: 'rgba(255, 255, 255, 0.95)',
        letterSpacing: '6px',
        lineHeight: '1',
        margin: 0,
        textShadow: '0 0 25px rgba(255, 255, 255, 0.3)',
        pointerEvents: 'none'
    },

    borderSvg: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1
    },

    creativeContainer: {
        position: 'absolute',
        left: '30px',
        top: '70%',
        transform: 'translateY(-50%)',
        zIndex: 1000
    },

    creativeText: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: 'clamp(0.8rem, 1.2vw, 1rem)',
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '2px'
    },

    creativeStatic: {
        color: 'rgba(248, 245, 220, 0.8)',
        marginBottom: '15px'
    },

    animatedWordBox: {
        border: '2px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '0px',
        padding: '20px 12px',
        height: '150px',
        width: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 15, 15, 0.3)',
        backdropFilter: 'blur(5px)'
    },

    creativeAnimated: {
        background: "linear-gradient(to bottom, rgb(223, 30, 114), rgb(230, 110, 41), rgb(255, 191, 0))",
        color: "transparent",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        fontWeight: '700',
        transition: 'font-family 0.02s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },

    mottoContainer: {
        position: 'absolute',
        right: '45px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        maxHeight: '80vh',
        overflow: 'hidden',
        fontSize: '1.0rem',
        fontFamily: "'anime', sans-serif",
        fontWeight: '500',
        textTransform: 'none',
        letterSpacing: '0.8px',
        color: 'rgba(248, 245, 220, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },

    purpleSection: {
        backgroundColor: 'rgb(31, 22, 35)',
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        zIndex: 0,
        marginTop: '0',

    },

    verticalLetter: {
        display: 'block',
        lineHeight: '1.2'
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

const speechBubbleStyles = `
@keyframes bubble-pop-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  80% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes bubble-pop-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

.speech-bubble.animate-in {
  animation: bubble-pop-in 0.6s ease-out forwards;
}

.speech-bubble.animate-out {
  animation: bubble-pop-out 0.4s ease-in forwards;
}

.speech-bubble {
  position: absolute;
  z-index: 10;
  pointer-events: none;
}

.speech-bubble-content {
  background: #fff !important;
  color: #000 !important;
  padding: 8px 10px !important;
  border-radius: 50% !important; 
  font-family: 'anime', Arial, sans-serif !important;
  font-size: 8px !important;
  font-weight: bold !important;
  text-align: center !important;
  white-space: normal !important;
  word-wrap: break-word !important;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.3),
    0 0 0 3px rgba(0, 0, 0, 0.1) !important;
  border: 2px solid #000 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative !important;
  min-width: 60px !important;
  min-height: 40px !important;
  box-sizing: border-box !important;
  clip-path: ellipse(50% 50% at 50% 50%) !important;
}

.speech-bubble-content.valoria-shout {
  font-size: 14px !important;
  font-weight: 900 !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
  padding: 12px 15px !important;
}

.speech-bubble-tail-down {
  position: absolute !important;
  bottom: -15px !important;
  width: 0 !important;
  height: 0 !important;
  border-left: 10px solid transparent !important;
  border-right: 10px solid transparent !important;
  border-top: 15px solid #000000 !important;
  z-index: 1 !important;
  transform-origin: center top !important;
}

.speech-bubble-tail-down::before {
  content: '' !important;
  position: absolute !important;
  bottom: 2px !important;
  left: -12px !important;
  width: 0 !important;
  height: 0 !important;
  border-left: 12px solid transparent !important;
  border-right: 12px solid transparent !important;
  border-top: 17px solid #ffffff !important;
}

.speech-bubble-tail-up {
  position: absolute !important;
  top: -15px !important;
  width: 0 !important;
  height: 0 !important;
  border-left: 10px solid transparent !important;
  border-right: 10px solid transparent !important;
  border-bottom: 15px solid #000000 !important;
  z-index: 1 !important;
  transform-origin: center bottom !important;
}

.speech-bubble-tail-up::before {
  content: '' !important;
  position: absolute !important;
  top: 2px !important;
  left: -12px !important;
  width: 0 !important;
  height: 0 !important;
  border-left: 12px solid transparent !important;
  border-right: 12px solid transparent !important;
  border-bottom: 17px solid #ffffff !important;
}

.speech-bubble-tail-left {
  position: absolute !important;
  left: -11px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  width: 0 !important;
  height: 0 !important;
  border-top: 10px solid transparent !important;
  border-bottom: 10px solid transparent !important;
  border-right: 15px solid #000000 !important;
  z-index: 1 !important;
  transform-origin: right center !important;
}

.speech-bubble-tail-left::before {
  content: '' !important;
  position: absolute !important;
  left: 3px !important;
  top: -8px !important;
  width: 0 !important;
  height: 0 !important;
  border-top: 8px solid transparent !important;
  border-bottom: 8px solid transparent !important;
  border-right: 12px solid #ffffff !important;
}

.speech-bubble-tail-right {
  position: absolute !important;
  right: -15px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  width: 0 !important;
  height: 0 !important;
  border-top: 10px solid transparent !important;
  border-bottom: 10px solid transparent !important;
  border-left: 15px solid #000000 !important;
  z-index: 1 !important;
  transform-origin: left center !important;
}

.speech-bubble-tail-right::before {
  content: '' !important;
  position: absolute !important;
  right: 2px !important;
  top: -12px !important;
  width: 0 !important;
  height: 0 !important;
  border-top: 12px solid transparent !important;
  border-bottom: 12px solid transparent !important;
  border-left: 17px solid #ffffff !important;
}
`;

if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = speechBubbleStyles;
    document.head.appendChild(styleSheet);
}

export default Body;