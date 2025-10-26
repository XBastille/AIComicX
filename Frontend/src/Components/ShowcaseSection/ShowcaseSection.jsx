import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function ShowcaseSection() {
    const products = [
        { name: 'ShowCase 1', subtitle: 'ShowCase name' },
        { name: 'ShowCase 2', subtitle: 'ShowCase name' },
        { name: 'ShowCAse 3', subtitle: 'ShowCase name' },
        { name: 'ShowCase 4', subtitle: 'ShowCase name' }
    ];

    const headingRef = useRef(null);
    const headingWrapperRef = useRef(null);
    const subheadingRef = useRef(null);
    const introRef = useRef(null);
    const rotationRef = useRef(null); 
    const cardGridRef = useRef(null);
    const energyBeamRef = useRef(null);
    const glitchLayerRef = useRef(null);
    const component = useRef(null);
    const [glitchText, setGlitchText] = useState("Experience Comics Beyond Limits");



    const styles = {
        container: {
            minHeight: '100vh',
            padding: '64px 16px',
        },
        wrapper: {
            maxWidth: '1500px',
            margin: '0 auto'
        },
        intro: {
            position: 'relative',
            display: 'block'
        },
        headingWrapper: {
            position: 'relative',
            marginTop: '80px',
            marginBottom: '60px',
            height: '200px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
        },
        subheading: {
            marginTop: '-12px',
            marginBottom: '36px',
            textAlign: 'center',
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(1.05rem, 2.2vw, 1.5rem)',
            color: 'rgba(248,245,220,0.95)',
            letterSpacing: '0.04em',
            lineHeight: 1.4,
            maxWidth: '980px',
            marginLeft: 'auto',
            marginRight: 'auto'
        },
        subheadingWord: {
            display: 'inline-block',
            marginRight: '0.3em',
            opacity: 0,
            filter: 'blur(10px)',
            willChange: 'opacity, filter'
        },
        subheadingEm: {
            background: 'linear-gradient(to right, rgb(223, 30, 114), rgb(230, 110, 41), rgb(255, 191, 0))',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            fontWeight: 700
        },
        energyBeam: {
            position: 'absolute',
            top: '50%',
            left: 0,
            width: '100%',
            height: '10px',
            background: 'linear-gradient(to right, rgba(223, 30, 114, 0), rgba(223, 30, 114, 0.8) 20%, rgba(255, 191, 0, 0.8) 50%, rgba(230, 110, 41, 0.8) 80%, rgba(223, 30, 114, 0))',
            transform: 'translateY(-50%) scaleX(0)',
            transformOrigin: 'left center',
            filter: 'blur(5px)',
            boxShadow: '0 0 30px rgba(223, 30, 114, 0.9), 0 0 50px rgba(255, 191, 0, 0.5)',
            zIndex: 9
        },
        glitchLayer: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'repeating-linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.03) 1px, transparent 2px)',
            pointerEvents: 'none',
            zIndex: 8,
            mixBlendMode: 'overlay'
        },
        heading: {
            position: 'relative',
            fontSize: 'clamp(2rem, 4.4vw, 7.6rem)',
            fontWeight: 700,
            textAlign: 'center',
            fontFamily: "'Orbitron', sans-serif",
            textTransform: 'uppercase',
            letterSpacing: '0.005em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            maxWidth: '100vw',
            overflow: 'hidden',
            zIndex: 10,
            margin: 0,
            background: "linear-gradient(to right, rgb(223, 30, 114), rgb(255, 123, 0), rgb(255, 191, 0))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            willChange: 'opacity, transform, text-shadow',
            mixBlendMode: 'lighten'
        },
        grid: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '600px',
            position: 'relative',
            width: '100%',
            pointerEvents: 'none' 
        },
        box: {
            position: 'absolute',
            height: '450px',
            width: '370px',
            borderRadius: '24px',
            overflow: 'hidden',
            backgroundColor: '#333',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            cursor: 'pointer',
            willChange: 'transform, filter',
            transition: 'box-shadow 0.3s ease',
            pointerEvents: 'auto' 
        },
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.1)'
        },
        content: {
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '32px',
            color: 'white',
            zIndex: 1
        },
        textSection: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        },
        productName: {
            fontSize: '32px',
            fontWeight: '300',
            marginBottom: '12px',
            letterSpacing: '0.05em'
        },
        subtitle: {
            fontSize: '14px',
            fontWeight: '300',
            opacity: 0.9,
            lineHeight: '1.6'
        },
        iconContainer: {
            display: 'flex',
            justifyContent: 'center'
        },
        plusIcon: {
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.3s ease'
        },
        plusSymbol: {
            fontSize: '24px',
            fontWeight: '300',
            opacity: 0.6
        }
    };



    const OFF_LEFT_INDEX = 0; 
    const arcPositions = [
        { left: '-15%', top: '80%', zIndex: 0, scale: 0.85, rotation: -25 },
        { left: '20%', top: '55%', zIndex: 1, scale: 0.95, rotation: -15 }, 
        { left: '50%', top: '45%', zIndex: 2, scale: 1.08, rotation: 0 }, 
        { left: '80%', top: '55%', zIndex: 1, scale: 0.95, rotation: 15 }, 
        { left: '115%', top: '80%', zIndex: 0, scale: 0.85, rotation: 25 } 
    ];

    useEffect(() => {
        const heading = headingRef.current;
        const energyBeam = energyBeamRef.current;
        const glitchLayer = glitchLayerRef.current;
        const subheading = subheadingRef.current;
        const boxes = gsap.utils.toArray('.product-box');
        const subWords = gsap.utils.toArray('.subheading-word');
        
        const numPositions = arcPositions.length;

        gsap.set(heading, { opacity: 0, scale: 0.9 });
        gsap.set(glitchLayer, { opacity: 0, scale: 1.1 });
        gsap.set(energyBeam, { scaleX: 0, opacity: 0 });
        gsap.set(subWords, { opacity: 0, filter: 'blur(10px)' });
        gsap.set(boxes, { autoAlpha: 0 });

        boxes.forEach((box, i) => {
            gsap.set(box, {
                xPercent: -50,
                yPercent: -50,
                ...arcPositions[(i + 1) % numPositions]
            });
        });

        const introTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: introRef.current,
                start: 'top top',
                end: '+=800', 
                pin: true,
                scrub: 0.9,
                anticipatePin: 1,
                pinSpacing: true,
                invalidateOnRefresh: true,
                id: 'intro-pin',
                onLeave: () => {
                    cardEntranceTimeline.play(0);
                },
                onEnterBack: () => {
                    cardRotationTimeline.scrollTrigger?.disable();
                    cardEntranceTimeline.reverse(0);
                }
            }
        });

        introTimeline.to(energyBeam, {
            opacity: 0.8,
            duration: 0.3,
            ease: "power2.in"
        }, 0);

        introTimeline.to(energyBeam, {
            scaleX: 1,
            duration: 0.5,
            ease: "power1.inOut"
        }, 0.3);

        introTimeline.to(glitchLayer, {
            opacity: 0.4,
            scale: 1,
            duration: 0.2
        }, 0.6);

        const finalText = "Experience Comics Beyond Limits";
        const scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*0123456789";
        
        introTimeline.to(heading, {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            onUpdate: function() {
                const progress = this.progress();
                if (progress < 0.95) { 
                    const scrambled = finalText.split('').map((char, idx) => {
                        const revealPoint = idx / finalText.length;
                        if (progress >= revealPoint) {
                            return char; 
                        } else {
                            return char === ' ' ? ' ' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                        }
                    }).join('');
                    setGlitchText(scrambled);
                } else {
                    setGlitchText(finalText); 
                }
            }
        }, 0.8);

        introTimeline.to(energyBeam, { opacity: 0, duration: 0.2 }, 1.0);
        introTimeline.to(glitchLayer, { opacity: 0, duration: 0.3 }, 1.0);

        introTimeline.to(heading, {
            textShadow: "0 0 20px rgba(223, 30, 114, 0.9), 0 0 30px rgba(255, 191, 0, 0.7), 0 0 40px rgba(255, 255, 255, 0.5)",
            duration: 0.3
        }, 1.2);

        introTimeline.to(heading, {
            textShadow: "0 0 0px transparent",
            duration: 0.3
        }, 1.5);

        subWords.forEach((word, index) => {
            introTimeline.to(word, {
                opacity: 1,
                filter: 'blur(0px)',
                duration: 0.12,
                ease: 'power2.out'
            }, 1.6 + (index * 0.06));
        });

        const cardEntranceTimeline = gsap.timeline({ paused: true });

        gsap.set(cardGridRef.current, { autoAlpha: 0 });

        const finalIndexByCard = [2, 3, 4, 1];

        boxes.forEach((box, i) => {
            const finalIndex = finalIndexByCard[i];

            cardEntranceTimeline.set(box, {
                left: arcPositions[OFF_LEFT_INDEX].left,
                top: arcPositions[OFF_LEFT_INDEX].top,
                scale: arcPositions[OFF_LEFT_INDEX].scale,
                zIndex: arcPositions[OFF_LEFT_INDEX].zIndex,
                rotation: arcPositions[OFF_LEFT_INDEX].rotation,
                autoAlpha: 0
            }, 0);

            const path = [];
            for (let idx = 1; idx !== (finalIndex + 1) % numPositions; idx = (idx + 1) % numPositions) {
                if (idx === 0) break;
                path.push(idx);
                if (idx === finalIndex) break;
            }

            path.forEach((pi, step) => {
                const t = Math.min(0.12 + step * 0.12, 0.5); 
                const p = arcPositions[pi];
                cardEntranceTimeline.to(box, {
                    left: p.left,
                    top: p.top,
                    scale: p.scale,
                    zIndex: p.zIndex,
                    rotation: p.rotation,
                    duration: t,
                    ease: step === path.length - 1 ? 'power3.out' : 'power1.inOut'
                }, 0);
            });

            cardEntranceTimeline.to(box, { autoAlpha: 1, duration: 0.2, ease: 'power2.out' }, 0.1);
        });

        cardEntranceTimeline.to(cardGridRef.current, { autoAlpha: 1, duration: 0.2 }, 0);

        const cardRotationTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: cardGridRef.current,
                start: 'top top', 
                end: '+=1800',
                pin: true,
                scrub: 0.8,
                anticipatePin: 1,
                pinSpacing: true,
                invalidateOnRefresh: true,
                id: 'card-rotation-pin'
            }
        });
        cardRotationTimeline.scrollTrigger?.disable();

        cardEntranceTimeline.eventCallback('onComplete', () => {
            cardRotationTimeline.scrollTrigger?.enable();
        });

        
        for (let step = 1; step <= 3; step++) {
            const timelinePos = (step - 1) * 0.6; 
            
            boxes.forEach((box, i) => {
                const startPos = finalIndexByCard[i];
                
                let targetPosIndex = startPos - step;
                
                while (targetPosIndex < 1) {
                    targetPosIndex += 4; 
                }
                
                const targetPos = arcPositions[targetPosIndex];
                
                cardRotationTimeline.to(box, {
                    left: targetPos.left,
                    top: targetPos.top,
                    scale: targetPos.scale,
                    zIndex: targetPos.zIndex,
                    rotation: targetPos.rotation,
                    duration: 0.5,
                    ease: 'power2.inOut'
                }, timelinePos);
            });
        }

        boxes.forEach((box, i) => {
            gsap.to(box, {
                y: '+=6',
                duration: 2.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: i * 0.4
            });
        });

        return () => {
            introTimeline.kill();
            cardEntranceTimeline.kill();
            cardRotationTimeline.kill();
            ScrollTrigger.getById('intro-pin')?.kill();
            ScrollTrigger.getById('card-rotation-pin')?.kill();
        };
    }, []);

    return (
        <div style={styles.container} ref={component}>
            <div style={styles.wrapper}>
                <div ref={rotationRef}>
                    <div ref={introRef} style={styles.intro}>
                        <div style={styles.headingWrapper} ref={headingWrapperRef}>
                            <div style={styles.energyBeam} ref={energyBeamRef}></div>
                            <div style={styles.glitchLayer} ref={glitchLayerRef}></div>
                            <h1
                                ref={headingRef}
                                className="Story-tag cyber-text"
                                style={styles.heading}
                            >
                                {glitchText}
                            </h1>
                        </div>

                        <p ref={subheadingRef} style={styles.subheading}>
                        <span className="subheading-word" style={styles.subheadingWord}>Witness</span>
                        <span className="subheading-word" style={styles.subheadingWord}>the</span>
                        <span className="subheading-word" style={{...styles.subheadingWord, ...styles.subheadingEm}}>power</span>
                        <span className="subheading-word" style={styles.subheadingWord}>of</span>
                        <span className="subheading-word" style={{...styles.subheadingWord, ...styles.subheadingEm}}>AI-driven</span>
                        <span className="subheading-word" style={{...styles.subheadingWord, ...styles.subheadingEm}}>artistry</span>
                        <span className="subheading-word" style={styles.subheadingWord}>as</span>
                        <span className="subheading-word" style={styles.subheadingWord}>our</span>
                        <span className="subheading-word" style={styles.subheadingWord}>model</span>
                        <span className="subheading-word" style={styles.subheadingWord}>transforms</span>
                        <span className="subheading-word" style={styles.subheadingWord}>your</span>
                        <span className="subheading-word" style={{...styles.subheadingWord, ...styles.subheadingEm}}>narratives</span>
                        <span className="subheading-word" style={styles.subheadingWord}>into</span>
                        <span className="subheading-word" style={styles.subheadingWord}>stunning</span>
                        <span className="subheading-word" style={styles.subheadingWord}>visual</span>
                        <span className="subheading-word" style={styles.subheadingWord}>experiences</span>
                    </p>
                </div>

                <div ref={cardGridRef} style={styles.grid}>
                    {products.map((product, index) => (
                        <div
                            key={index}
                            className="product-box"
                            style={styles.box}
                        >
                            <div style={styles.overlay}></div>
                            <div style={styles.content}>
                                <div style={styles.textSection}>
                                    <h2 style={styles.productName}>{product.name}</h2>
                                    <p style={styles.subtitle}>{product.subtitle}</p>
                                </div>
                                <div style={styles.iconContainer}>
                                    <div style={styles.plusIcon}>
                                        <span style={styles.plusSymbol}>i</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                </div> 
            </div>
        </div>
    );
}

export default ShowcaseSection;