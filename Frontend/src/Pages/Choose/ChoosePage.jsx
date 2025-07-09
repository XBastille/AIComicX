import React, { useEffect, useRef, useState } from "react";
import "./ChoosePage.css";
import narrationImage from "../../Picture/nar.jpg"
import storyImage from "../../Picture/story.jpg";
import sam from "../../Picture/sam.png";
import Nav_2 from "../../Components/Nav_2/Nav_2";
import axios from 'axios'
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";

function ChoosePage() {
    const [selectedType, setSelectedType] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const headingRef = useRef(null);
    const headingWrapperRef = useRef(null);
    const energyBeamRef = useRef(null);
    const glitchLayerRef = useRef(null);
    const box1Ref = useRef(null);
    const box2Ref = useRef(null);
    const box3Ref = useRef(null);
    const containerRef = useRef(null);
    const uploadContainerRef = useRef(null);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [filePreview, setFilePreview] = useState('');
    const [errors, setErrors] = useState('');
    const selectionPulseRef = useRef(null);
    const digitalParticlesRef = useRef(null);
    const navigate = useNavigate();


    useEffect(() => {
        gsap.set([box1Ref.current, box2Ref.current, box3Ref.current], {
            autoAlpha: 0,
            scale: 0.8,
            rotationY: 80,
            transformPerspective: 600
        });

        const heading = headingRef.current;
        const headingWrapper = headingWrapperRef.current;
        const energyBeam = energyBeamRef.current;
        const glitchLayer = glitchLayerRef.current;

        gsap.set(heading, {
            opacity: 0,
            scale: 0.9,
        });

        gsap.set(glitchLayer, {
            opacity: 0,
            scale: 1.1
        });

        gsap.set(energyBeam, {
            scaleX: 0,
            opacity: 0
        });

        const masterTl = gsap.timeline({
            delay: 0.5,
            defaults: { ease: "power3.out" },
            onComplete: () => setAnimationComplete(true)
        });

        masterTl.to(energyBeam, {
            opacity: 0.8,
            duration: 0.4,
            ease: "power2.in"
        });

        masterTl.to(energyBeam, {
            scaleX: 1,
            duration: 0.8,
            ease: "power1.inOut",
        });

        masterTl.to(glitchLayer, {
            opacity: 0.4,
            scale: 1,
            duration: 0.2,
        });

        masterTl.to(heading, {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            onStart: () => {
                const text = "Choose Your Story Format";
                const chars = text.split('');
                const glitchDuration = 0.8;
                const glitchInterval = setInterval(() => {
                    for (let i = 0; i < 3; i++) {
                        const idx = Math.floor(Math.random() * chars.length);
                        const originalChar = chars[idx];
                        chars[idx] = '!@#$%^&*'[Math.floor(Math.random() * 8)];
                        heading.textContent = chars.join('');

                        setTimeout(() => {
                            chars[idx] = originalChar;
                            heading.textContent = chars.join('');
                        }, 50);
                    }
                }, 100);

                setTimeout(() => {
                    clearInterval(glitchInterval);
                    heading.textContent = "Choose Your Story Format";
                }, glitchDuration * 1000);
            }
        }, "+=0.1");

        masterTl.to(energyBeam, {
            opacity: 0,
            duration: 0.3,
        }, "-=0.2");

        masterTl.to(glitchLayer, {
            opacity: 0,
            duration: 0.5,
        }, "-=0.2");

        masterTl.to(heading, {
            textShadow: "0 0 20px rgba(223, 30, 114, 0.9), 0 0 30px rgba(255, 191, 0, 0.7), 0 0 40px rgba(255, 255, 255, 0.5)",
            duration: 0.4,
            repeat: 1,
            yoyo: true
        }, "-=0.1");

        masterTl.to(containerRef.current, {
            rotationX: 15,
            duration: 1,
            ease: "power2.inOut",
        }, "+=0.2");

        masterTl.to(box1Ref.current, {
            duration: 0.8,
            autoAlpha: 1,
            scale: 1,
            rotationY: 0,
            ease: "back.out(1.7)",
            boxShadow: "0 0 30px rgba(223, 30, 114, 0.7)",
            onComplete: () => {
                gsap.set(box1Ref.current, { animationPlayState: "running" });
            }
        }, "+=0.1");

        masterTl.to(box2Ref.current, {
            duration: 0.8,
            autoAlpha: 1,
            scale: 1,
            rotationY: 0,
            ease: "back.out(1.7)",
            boxShadow: "0 0 30px rgba(230, 110, 41, 0.7)",
            onComplete: () => {
                gsap.set(box2Ref.current, { animationPlayState: "running" });
            }
        }, "-=0.6");

        masterTl.to(box3Ref.current, {
            duration: 0.8,
            autoAlpha: 1,
            scale: 1,
            rotationY: 0,
            ease: "back.out(1.7)",
            boxShadow: "0 0 30px rgba(255, 191, 0, 0.7)",
            onComplete: () => {
                gsap.set(box3Ref.current, { animationPlayState: "running" });
            }
        }, "-=0.6");

        masterTl.to(containerRef.current, {
            rotationX: 0,
            duration: 0.8,
            ease: "power2.inOut",
        }, "+=0.2");

        gsap.to([box1Ref.current, box2Ref.current, box3Ref.current], {
            y: "-=10",
            duration: 1.5,
            ease: "sine.inOut",
            stagger: 0.2,
            repeat: -1,
            yoyo: true,
            delay: masterTl.duration() + 0.5
        });

        return () => {
            masterTl.kill();
            gsap.killTweensOf([box1Ref.current, box2Ref.current, box3Ref.current, heading, energyBeam, glitchLayer]);
        };
    }, []);

    const handleBoxSelect = (boxType) => {
        if (isTransitioning) return;
        setIsTransitioning(true);

        const box = boxType === 'dialogue' ? box1Ref.current :
            boxType === 'story' ? box2Ref.current : box3Ref.current;

        if (!box) return;

        if (boxType === 'sam') {
            gsap.to(box, {
                boxShadow: "0 0 30px rgba(255, 191, 0, 1)",
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                onComplete: () => setIsTransitioning(false)
            });
            navigate('/PromptPage')
            return;
        }

        const gridContainer = document.createElement("div");
        gridContainer.className = "grid-scan-container";
        gridContainer.style.zIndex = "100";
        box.appendChild(gridContainer);

        const numRows = 15;
        const numCols = 10;

        const squareSize = box.offsetWidth / numCols;

        const squares = [];

        for (let row = 0; row < numRows; row++) {
            const rowSquares = [];
            for (let col = 0; col < numCols; col++) {
                const square = document.createElement("div");
                square.className = "scan-square";

                square.style.width = `${squareSize}px`;
                square.style.height = `${squareSize}px`;
                square.style.left = `${col * squareSize}px`;
                square.style.top = `${row * squareSize}px`;

                const isEven = (row + col) % 2 === 0;
                square.classList.add(isEven ? 'square-even' : 'square-odd');

                gridContainer.appendChild(square);
                rowSquares.push(square);
            }
            squares.push(rowSquares);
        }

        const scanLine = document.createElement("div");
        scanLine.className = "scan-line";
        box.appendChild(scanLine);

        gsap.set(scanLine, {
            top: 0,
            opacity: 0
        });

        const scanTl = gsap.timeline({
            onComplete: () => {
                gsap.to(box, {
                    boxShadow: "0 0 50px rgba(255, 191, 0, 0.8)",
                    duration: 0.2,
                    repeat: 1,
                    yoyo: true,
                    onComplete: () => animateBoxesOut(boxType)
                });
            }
        });

        scanTl.to(scanLine, {
            opacity: 1,
            duration: 0.15
        });

        scanTl.to(scanLine, {
            top: box.offsetHeight,
            duration: 0.8,
            ease: "power1.inOut"
        }, 0);

        for (let row = 0; row < squares.length; row++) {
            const rowDelay = (row / squares.length) * 0.7;

            scanTl.to(squares[row], {
                opacity: 1,
                scale: 1,
                duration: 0.2,
                stagger: {
                    each: 0.02,
                    from: "random"
                },
                ease: "power2.out"
            }, 0.15 + rowDelay);

            scanTl.to(squares[row], {
                opacity: 0,
                scale: 0.8,
                duration: 0.2,
                stagger: {
                    each: 0.01,
                    from: "random"
                },
                ease: "power1.in"
            }, 0.15 + rowDelay + 0.3);
        }

        scanTl.to(scanLine, {
            opacity: 0,
            duration: 0.2
        }, "-=0.2");
    };

    const animateBoxesOut = (selectedType) => {
        const tl = gsap.timeline({
            onComplete: () => {
                document.querySelectorAll(".selection-pulse, .digital-particles").forEach(el => {
                    if (el && el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                });

                setSelectedType(selectedType);
                setIsTransitioning(false);

                animateUploadContainerIn();
            }
        });

        tl.to(box1Ref.current, {
            autoAlpha: 0,
            x: -200,
            rotationY: -45,
            duration: 0.6,
            ease: "power2.in"
        }, 0);

        tl.to(box2Ref.current, {
            autoAlpha: 0,
            y: -150,
            rotationX: 45,
            duration: 0.6,
            ease: "power2.in"
        }, 0.1);

        tl.to(box3Ref.current, {
            autoAlpha: 0,
            x: 200,
            rotationY: 45,
            duration: 0.6,
            ease: "power2.in"
        }, 0.2);

        tl.to(containerRef.current, {
            rotationX: -10,
            duration: 0.5,
            ease: "power1.inOut"
        }, 0);

        tl.to(containerRef.current, {
            autoAlpha: 0,
            duration: 0.3
        }, 0.4);
    };

    const animateUploadContainerIn = () => {
        setTimeout(() => {
            if (!uploadContainerRef.current) return;

            gsap.set(uploadContainerRef.current, {
                autoAlpha: 0,
                scale: 0.9,
                y: 50
            });

            const container = uploadContainerRef.current;

            const numGridLines = 15;
            const gridContainer = document.createElement("div");
            gridContainer.className = "grid-container";
            gridContainer.style.position = "absolute";
            gridContainer.style.top = "0";
            gridContainer.style.left = "0";
            gridContainer.style.width = "100%";
            gridContainer.style.height = "100%";
            gridContainer.style.pointerEvents = "none";
            gridContainer.style.zIndex = "50";

            for (let i = 0; i < numGridLines; i++) {
                const line = document.createElement("div");
                line.className = "grid-line horizontal";
                line.style.position = "absolute";
                line.style.height = "1px";
                line.style.width = "100%";
                line.style.background = "rgba(255, 191, 0, 0.5)";
                line.style.top = `${(i / numGridLines) * 100}%`;
                line.style.transform = "scaleX(0)";
                line.style.transformOrigin = "left";
                line.style.opacity = "0";

                gridContainer.appendChild(line);
            }

            for (let i = 0; i < numGridLines; i++) {
                const line = document.createElement("div");
                line.className = "grid-line vertical";
                line.style.position = "absolute";
                line.style.width = "1px";
                line.style.height = "100%";
                line.style.background = "rgba(223, 30, 114, 0.5)";
                line.style.left = `${(i / numGridLines) * 100}%`;
                line.style.transform = "scaleY(0)";
                line.style.transformOrigin = "top";
                line.style.opacity = "0";

                gridContainer.appendChild(line);
            }

            container.appendChild(gridContainer);

            const glowOverlay = document.createElement("div");
            glowOverlay.className = "glow-overlay";
            glowOverlay.style.position = "absolute";
            glowOverlay.style.top = "0";
            glowOverlay.style.left = "0";
            glowOverlay.style.width = "100%";
            glowOverlay.style.height = "100%";
            glowOverlay.style.background = "radial-gradient(circle at center, rgba(255, 191, 0, 0.2), transparent 70%)";
            glowOverlay.style.opacity = "0";
            glowOverlay.style.zIndex = "49";
            glowOverlay.style.pointerEvents = "none";

            container.appendChild(glowOverlay);

            const uploadTl = gsap.timeline();

            uploadTl.to(".grid-line.horizontal", {
                scaleX: 1,
                opacity: 0.7,
                duration: 0.5,
                stagger: 0.03,
                ease: "power1.out"
            });

            uploadTl.to(".grid-line.vertical", {
                scaleY: 1,
                opacity: 0.7,
                duration: 0.5,
                stagger: 0.03,
                ease: "power1.out"
            }, "-=0.3");

            uploadTl.to(uploadContainerRef.current, {
                autoAlpha: 1,
                scale: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out"
            }, "-=0.2");

            uploadTl.to(".glow-overlay", {
                opacity: 1,
                duration: 0.5,
                ease: "power1.inOut"
            }, "-=0.4");

            uploadTl.to([".grid-line.horizontal", ".grid-line.vertical"], {
                opacity: 0,
                duration: 0.5,
                ease: "power1.in",
                onComplete: () => {
                    setTimeout(() => {
                        if (gridContainer.parentNode) {
                            gridContainer.parentNode.removeChild(gridContainer);
                        }
                        if (glowOverlay.parentNode) {
                            glowOverlay.parentNode.removeChild(glowOverlay);
                        }
                    }, 100);
                }
            }, "+=0.5");

            uploadTl.to(uploadContainerRef.current, {
                boxShadow: "0 0 40px rgba(223, 30, 114, 0.5)",
                duration: 0.5,
                repeat: 1,
                yoyo: true
            }, "-=0.2");
        }, 50);
    };
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        // console.log(file)
        if (!file) return;

        setUploadedFile(file);

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result.substring(0, 200) +
                (event.target.result.length > 200 ? '...' : '');
            setFilePreview(text);
        };
        reader.readAsText(file);

        gsap.from(".file-preview", {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: "back.out(1.4)"
        });
    };

    const handleRemoveFile = () => {
        gsap.to(".file-preview", {
            y: 20,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                setUploadedFile(null);
                setFilePreview('');

                setTimeout(() => {
                    const uploadBox = document.querySelector(".upload-box");
                    if (uploadBox) {
                        gsap.set(uploadBox, {
                            opacity: 0,
                            y: 20
                        });

                        gsap.to(uploadBox, {
                            opacity: 1,
                            y: 0,
                            duration: 0.4,
                            ease: "back.out(1.4)"
                        });
                    }
                }, 0);
            }
        });
    };
    function timingout() {
        setTimeout(() => {
            setErrors('')
        }, 5000);
    }

    const conti = async (e) => {
        console.log(uploadedFile)

        const file = new FormData()
        file.append('file', uploadedFile)

        try {
            const response = await axios.post('http://localhost:3000/chat/transferNar2nar', file, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            console.log(response.data);
            if (response.data.sucess === true) {
                navigate('/Generate_Story')
            }
            else if (response.data.sucess === false) {
                setErrors(response.data.error[0].msg)
            }

        } catch (error) {
            console.log("Cannot send file to backend " + error)
        }
        gsap.to(".file-preview", {
            y: 20,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                setUploadedFile(null);
                setFilePreview('');

                setTimeout(() => {
                    const uploadBox = document.querySelector(".upload-box");
                    if (uploadBox) {
                        gsap.set(uploadBox, {
                            opacity: 0,
                            y: 20
                        });

                        gsap.to(uploadBox, {
                            opacity: 1,
                            y: 0,
                            duration: 0.4,
                            ease: "back.out(1.4)"
                        });
                    }
                }, 0);
            }
        });
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const st2nar = async () => {
        console.log(uploadedFile)

        const file = new FormData()
        file.append('file', uploadedFile)

        try {
            const response = await axios.post('http://localhost:3000/chat/transferSt2nar', file, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            console.log(response.data);
            if (response.data.sucess === true) {
                navigate('/Generate_Story')
            }
            else if (response.data.sucess === false) {
                setErrors(response.data.error[0].msg)
            }

        } catch (error) {
            console.log("Cannot send file to backend " + error)
        }
        gsap.to(".file-preview", {
            y: 20,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                setUploadedFile(null);
                setFilePreview('');

                setTimeout(() => {
                    const uploadBox = document.querySelector(".upload-box");
                    if (uploadBox) {
                        gsap.set(uploadBox, {
                            opacity: 0,
                            y: 20
                        });

                        gsap.to(uploadBox, {
                            opacity: 1,
                            y: 0,
                            duration: 0.4,
                            ease: "back.out(1.4)"
                        });
                    }
                }, 0);
            }
        });
    }

    const renderUploadUI = () => {
        if (selectedType === 'dialogue') {
            return (
                <div className="upload-container" ref={uploadContainerRef}>
                    <div className="upload-header">
                        <h2 className="upload-title cyber-text">Dialogue-Story Upload</h2>
                        <div className="format-notice">
                            <div className="notice-icon">!</div>
                            <p>Please ensure your file is in dialogue-narration format. Uploading incorrect format will result in poor comic generation.</p>
                        </div>
                    </div>

                    <div className="upload-area">
                        {!uploadedFile ? (
                            <div className="upload-box">
                                <div className="upload-icon">+</div>
                                <p>Drag & drop your dialogue file here or click to browse</p>
                                <input
                                    type="file"
                                    className="file-input"
                                    onChange={handleFileUpload}
                                    accept=".txt,.doc,.docx,.pdf"
                                    name="file"
                                />
                            </div>
                        ) : (
                            <div className="file-preview">
                                <div className="file-preview-header">
                                    <div className="file-preview-title">
                                        <span className="file-icon">📄</span>
                                        {uploadedFile.name}
                                    </div>
                                    <div className="file-remove" onClick={handleRemoveFile}>✕</div>
                                </div>
                                <div className="file-details">
                                    <span>Size: {formatFileSize(uploadedFile.size)}</span>
                                    <span>Type: {uploadedFile.type || 'text/plain'}</span>
                                </div>
                                {filePreview && (
                                    <div className="file-text-preview">
                                        {filePreview}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="format-example">
                            <h3>Expected Format Example:</h3>
                            <pre>
                                Character1: This is how dialogue should look.<br />
                                Character2: The name followed by a colon, then the dialogue.<br />
                                Narrator: [Scene description goes here]
                            </pre>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button
                            className="continue-button"
                            disabled={!uploadedFile}
                            style={{ opacity: uploadedFile ? 1 : 0.6, cursor: uploadedFile ? 'pointer' : 'not-allowed', width: '100%' }} onClick={conti} >
                            Continue
                        </button>
                    </div>
                </div>
            );
        } else if (selectedType === 'story') {
            return (
                <div className="upload-container" ref={uploadContainerRef}>
                    <div className="upload-header">
                        <h2 className="upload-title cyber-text">Story Upload</h2>
                        <div className="format-notice">
                            <div className="notice-icon">!</div>
                            <p>Please ensure your file is in proper narrative story format. Uploading incorrect format will result in poor comic generation.</p>
                        </div>
                    </div>

                    <div className="upload-area">
                        {!uploadedFile ? (
                            <div className="upload-box">
                                <div className="upload-icon">+</div>
                                <p>Drag & drop your story file here or click to browse</p>
                                <input
                                    type="file"
                                    className="file-input"
                                    onChange={handleFileUpload}
                                    accept=".txt,.doc,.docx,.pdf"
                                />
                            </div>
                        ) : (
                            <div className="file-preview">
                                <div className="file-preview-header">
                                    <div className="file-preview-title">
                                        <span className="file-icon">📄</span>
                                        {uploadedFile.name}
                                    </div>
                                    <div className="file-remove" onClick={handleRemoveFile}>✕</div>
                                </div>
                                <div className="file-details">
                                    <span>Size: {formatFileSize(uploadedFile.size)}</span>
                                    <span>Type: {uploadedFile.type || 'text/plain'}</span>
                                </div>
                                {filePreview && (
                                    <div className="file-text-preview">
                                        {filePreview}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="format-example">
                            <h3>Expected Format Example:</h3>
                            <pre>
                                A proper narrative story with descriptive paragraphs.<br />
                                The AI will generate comic scenes based on the<br />
                                narrative flow and descriptions in your story.
                            </pre>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button
                            className="continue-button"
                            disabled={!uploadedFile}
                            style={{ opacity: uploadedFile ? 1 : 0.6, cursor: uploadedFile ? 'pointer' : 'not-allowed', width: '100%' }}
                            onClick={st2nar}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            );
        }
        {
            errors && (
                <p className="error" style={{
                    ...styles.error,
                    marginTop: errors ? "40px" : "20px",

                }} {...timingout()} > {errors} </p>
            )
        }

        return null;
    };

    const handleBack = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);

        gsap.to(uploadContainerRef.current, {
            autoAlpha: 0,
            y: 50,
            scale: 0.9,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                setSelectedType(null);
                setIsTransitioning(false);
                setUploadedFile(null);
                setFilePreview('');

                gsap.set([box1Ref.current, box2Ref.current, box3Ref.current], {
                    autoAlpha: 0,
                    clearProps: "x,y,rotationX,rotationY"
                });

                gsap.set(containerRef.current, {
                    autoAlpha: 1,
                    rotationX: 0
                });

                const boxesTl = gsap.timeline();

                boxesTl.to(box1Ref.current, {
                    autoAlpha: 1,
                    scale: 1,
                    duration: 0.6,
                    ease: "back.out(1.7)"
                }, 0);

                boxesTl.to(box2Ref.current, {
                    autoAlpha: 1,
                    scale: 1,
                    duration: 0.6,
                    ease: "back.out(1.7)"
                }, 0.1);

                boxesTl.to(box3Ref.current, {
                    autoAlpha: 1,
                    scale: 1,
                    duration: 0.6,
                    ease: "back.out(1.7)"
                }, 0.2);

                gsap.to([box1Ref.current, box2Ref.current, box3Ref.current], {
                    y: "-=10",
                    duration: 1.5,
                    ease: "sine.inOut",
                    stagger: 0.2,
                    repeat: -1,
                    yoyo: true,
                    delay: 1
                });
            }
        });
    };


    return (
        <>
            <Nav_2 showBack={selectedType !== null} onBackClick={handleBack} />

            <div className="Story-Container">
                <div className="heading-wrapper" ref={headingWrapperRef}>
                    <div className="energy-beam" ref={energyBeamRef}></div>
                    <div className="glitch-layer" ref={glitchLayerRef}></div>
                    <h1
                        ref={headingRef}
                        className={`Story-tag cyber-text ${animationComplete ? 'animation-complete' : ''}`}
                    >
                        Choose Your Story Format
                    </h1>
                </div>

                {!selectedType && (
                    <div ref={containerRef} className="Boxes">
                        <div
                            ref={box1Ref}
                            className="Box1"
                            onClick={() => handleBoxSelect('dialogue')}
                        >
                            <div className="info-btn">i</div>
                            <div className="info-tooltip">
                                This option allows you to upload a dialogue-narration style story format.
                            </div>
                            <div className="image-container">
                                <img src={narrationImage} alt="Dialogue-Story Style" />
                            </div>
                            <p className="smallText">Dialogue-Story Style</p>
                        </div>
                        <div
                            ref={box2Ref}
                            className="Box2"
                            onClick={() => handleBoxSelect('story')}
                        >
                            <div className="info-btn">i</div>
                            <div className="info-tooltip">
                                This option allows you to upload a normal style story format.
                            </div>
                            <div className="image-container">
                                <img src={storyImage} alt="Story" />
                            </div>
                            <p className="smallText">Story</p>
                        </div>
                        <div
                            ref={box3Ref}
                            className="Box3"
                            onClick={() => {
                                handleBoxSelect('sam')
                            }
                            }
                        >
                            <div className="info-btn">i</div>
                            <div className="info-tooltip">
                                chat with SAM (a Large Language Model) to generate an awesome story.
                            </div>
                            <div className="image-container">
                                <img src={sam} alt="Generate Story" />
                            </div>
                            <p className="smallText">Generate Story</p>
                        </div>
                    </div>
                )}

                {selectedType && renderUploadUI()}
            </div>
        </>
    );
}

const styles = {
    error: {
        position: 'absolute',
        top: '410px',
        left: '280px',
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        color: 'white',
        padding: '13px 35px',
        borderRadius: '7px',
        fontSize: '16px',
        fontWeight: 'bold',
        textAlign: 'center',
    },
}

export default ChoosePage;
