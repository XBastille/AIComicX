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
        { name: 'ShowCase 4', subtitle: 'ShowCase name' },
        { name: 'ShowCase 5', subtitle: 'ShowCase name' },


    ];

    const headingRef = useRef(null);
    const headingWrapperRef = useRef(null);
    const energyBeamRef = useRef(null);
    const glitchLayerRef = useRef(null);
    const [animationComplete, setAnimationComplete] = useState(false);
    const component = useRef(null);



    const styles = {
        container: {
            minHeight: '100vh',
            padding: '64px 16px',
            // border: '2px solid white'
        },
        wrapper: {
            maxWidth: '1500px',
            margin: '0 auto'
        },
        heading: {
            marginTop: "50px",
            marginBottom: "50px",
            fontSize: "50px",
            fontWeight: "500",
            background: "linear-gradient(to right,rgb(223, 30, 114),rgb(230, 110, 41),rgb(255, 191, 0))",
            color: "transparent",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            WebkitBackgroundClip: "text"
        },
        grid: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '600px',
            position: 'relative',
            width: '100%'
        },
        box: {
            position: 'absolute',
            height: '450px',
            width: '370px',
            borderRadius: '24px',
            overflow: 'hidden',
            backgroundColor: '#333',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            cursor: 'pointer'
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



    const arcPositions = [

        { left: '20%', top: '55%', rotation: -15, zIndex: 1, scale: 1 },
        { left: '50%', top: '45%', rotation: 0, zIndex: 2, scale: 1 },
        { left: '80%', top: '55%', rotation: 15, zIndex: 1, scale: 1 },
        // Off-screen positions for a seamless loop
        { left: '115%', top: '80%', rotation: 30, zIndex: 0, scale: 1 },
        { left: '-15%', top: '80%', rotation: -30, zIndex: 0, scale: 1 }
    ];

    useEffect(() => {

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
            scrollTrigger: {
                trigger: component.current,
            },
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
                const text = "Our Team's Great Work Showcase";
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
                    heading.textContent = "Our Team's Great Work Showcase";
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

        return () => {
            masterTl.kill();
            gsap.killTweensOf([heading, energyBeam, glitchLayer]);
        };
    }, []);

    useEffect(() => {
        let ctx = gsap.context(() => {


            const boxes = gsap.utils.toArray('.product-box');
            const numPositions = arcPositions.length;

            const masterTl = gsap.timeline({
                scrollTrigger: {
                    trigger: component.current,
                    scrub: 1,
                    start: 'top top',
                    end: `+=${numPositions * 120}`,
                }
            });

            boxes.forEach((box, i) => {
                gsap.set(box, {
                    xPercent: -50,
                    yPercent: -50,
                    ...arcPositions[i]
                });

                const boxTl = gsap.timeline();

                for (let k = 1; k <= numPositions; k++) {
                    const targetIndex = (i + k) % numPositions;

                    // when wrapping from rightmost (index 3) to leftmost (index 4) => use set()
                    if (targetIndex === 4) {
                        boxTl.set(box, {
                            ...arcPositions[targetIndex],
                        });
                    } else {
                        boxTl.to(box, {
                            ...arcPositions[targetIndex],
                            duration: 1,
                            ease: 'none'
                        });
                    }
                }

                masterTl.add(boxTl, 0);
            });
        }, component);

        return () => ctx.revert();
    }, []);



    useEffect(() => {

        let ctx = gsap.context(() => {

            const boxes = gsap.utils.toArray('.product-box');
            const numPositions = arcPositions.length;


            const masterTl = gsap.timeline({
                scrollTrigger: {
                    trigger: component.current,
                    start: 'top 80%',
                    end: `+=${numPositions * 120}`,
                },
                repeat: 3
            });

            boxes.forEach((box, i) => {

                gsap.set(box, {
                    xPercent: -50,
                    yPercent: -50,
                    ...arcPositions[i]
                });

                const boxTl = gsap.timeline();
                for (let k = 1; k <= numPositions; k++) {
                    const targetIndex = (i + k) % numPositions;
                    if (targetIndex === 4) {
                        boxTl.set(box, {
                            ...arcPositions[targetIndex],
                        });
                    } else {
                        boxTl.to(box, {
                            ...arcPositions[targetIndex],
                            duration: 0.2,
                            ease: 'none'
                        });
                    }
                }


                masterTl.add(boxTl, 0);
            });
            // masterTl.duration(3);
        }, component);

        return () => ctx.revert();
    }, []);

    return (
        <div style={styles.container} ref={component}>
            <div style={styles.wrapper}>
                <div className="heading-wrapper" ref={headingWrapperRef}>
                    <div className="energy-beam" ref={energyBeamRef}></div>
                    <div className="glitch-layer" ref={glitchLayerRef}></div>
                    <h1
                        ref={headingRef}
                        className={`Story-tag cyber-text ${animationComplete ? 'animation-complete' : ''}`}
                        style={styles.heading}
                    >
                        Our Team's Great Work Showcase
                    </h1>
                </div>
                {/* <p style={styles.heading}>Our Team's Great Work Showcase</p> */}

                <div style={styles.grid}>
                    {products.map((product, index) => (
                        index != 3 &&
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
    );
}

export default ShowcaseSection;