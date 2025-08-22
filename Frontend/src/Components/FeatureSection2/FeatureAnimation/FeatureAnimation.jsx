"use client";
import { motion, AnimatePresence, transform } from "framer-motion";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


export const FeatureAnimation = ({
    testimonials,
    autoplay = false
}) => {
    const [active, setActive] = useState(0);

    const handleNext = () => {
        setActive((prev) => (prev + 1) % testimonials.length);

    };

    const handlePrev = () => {
        setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    };

    const isActive = (index) => {
        return index === active;
    };



    useEffect(() => {
        if (autoplay) {
            const interval = setInterval(handleNext, 5000);
            return () => clearInterval(interval);
        }
    }, [autoplay]);

    const randomRotateY = () => {
        return Math.floor(Math.random() * 21) - 10;
    };

    const featureRef1 = useRef(null);

    useEffect(() => {
        const createScrambleAnimation = (element) => {
            if (!element) return;

            const originalText = element.innerText;
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
            let isAnimating = false;

            const scrambleText = () => {
                if (isAnimating) return;
                isAnimating = true;

                let iterations = 0;
                const totalDuration = 40;

                const interval = setInterval(() => {
                    const progress = iterations / totalDuration;
                    const revealIndex = Math.floor(progress * originalText.length);

                    element.innerText = originalText
                        .split("")
                        .map((letter, index) => {

                            if (index < revealIndex) {
                                return originalText[index];
                            }


                            if (letter === " ") {
                                return " ";
                            }


                            const scrambleIntensity = Math.max(0.1, 1 - (progress * 1.5));
                            if (Math.random() < scrambleIntensity) {
                                return chars[Math.floor(Math.random() * chars.length)];
                            }

                            return letter;
                        })
                        .join("");

                    iterations++;

                    if (iterations >= totalDuration) {
                        clearInterval(interval);
                        element.innerText = originalText;
                        isAnimating = false;
                    }
                }, 50);
            };

            ScrollTrigger.create({
                trigger: element,
                start: "top 80%",
                onEnter: () => scrambleText(),
                onEnterBack: () => scrambleText(),
            });
        };

        createScrambleAnimation(featureRef1.current);

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [active]);

    const [headingScrollMovement, setHeadingScrollMovement] = useState(-100);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        gsap.to(".epochHeading", {
            x: "-1000px", // how far it should move left
            ease: "none",
            scrollTrigger: {
                trigger: ".epochHeading",
                start: "top bottom", // when heading enters
                end: "bottom top",   // when heading leaves
                scrub: true,         // smooth scroll-linked
            },
        });
    }, []);

    const styles = {
        container: {
            margin: "0 auto",
            maxWidth: "68rem",
            // padding: "5rem 3rem",
            fontFamily: "sans-serif",
            antialiased: true,
        },
        grid: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "5rem",
        },
        imageWrapper: {
            position: "relative",
            width: "35rem",
            height: "25rem", // ~h-80
        },
        motionDiv: {
            position: "absolute",
            inset: 0,
            transformOrigin: "bottom",
        },
        img: {
            width: "100%",
            height: "100%",
            borderRadius: "1.5rem",
            objectFit: "cover",
            objectPosition: "center",
            userSelect: "none",
            pointerEvents: "none",
        },
        rightCol: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "1rem 0",
            with: "35rem",
        },
        name: {
            fontSize: "40px",
            fontWeight: "bold",
            background: "linear-gradient(to right,rgb(223, 30, 114),rgb(230, 110, 41),rgb(255, 191, 0))",
            color: "transparent",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
        },
        designation: {
            fontSize: "0.875rem",
            color: "#fff",
            marginTop: "0.25rem",
        },
        quote: {
            marginTop: "2rem",
            fontSize: "30px",
            color: "#fff",
            lineHeight: 1.5,
        },
        span: {
            display: "inline-block",
        },
        buttonRow: {
            marginTop: '-20px',
            right: ' 150px',
            display: 'flex',
            justifyContent: 'space- between',
            alignItems: 'center',
            gap: '20px',
            padding: '16px',
            height: '230px',
            width: '200px',
            // border: '1px solid white'
        },
        button: {
            border: '2px solid #d72b59',
            background: 'transparent',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '50%',
            fontSize: '24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            height: '50px',
            width: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        icon: {
            width: "1.25rem",
            height: "1.25rem",
            color: "#fff",
            transition: "transform 0.3s ease-in-out",
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
            WebkitBackgroundClip: "text",

        },
        epochHeading: {
            fontSize: "220px",
            transform: `translateX(100px)`,
            fontWeight: "800",
            // transform: "translateX(-30px)",
            willChange: "transform",
            whiteSpace: "nowrap",
            display: "inline-block",

            background: "linear-gradient(to right, rgb(223,30,114), rgb(230,110,41), rgb(255,191,0))",
            backgroundSize: "200% auto",
            backgroundRepeat: "no-repeat",
            color: "transparent",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
        }
    };


    return (
        <>
            <div style={{ width: "100vw" }}>
                <p className="epochHeading" style={styles.epochHeading}>...EPOCH PRESENTS EPOCH</p>
            </div>
            <div style={styles.container}>

                <p style={styles.heading}>What Amazing Things We Can Do</p>
                <div style={styles.grid}>
                    <div>
                        <div style={styles.imageWrapper}>
                            <AnimatePresence>
                                {testimonials.map((testimonial, index) => (
                                    <motion.div
                                        key={testimonial.src}
                                        initial={{
                                            opacity: 0,
                                            scale: 0.9,
                                            z: -100,
                                            rotate: randomRotateY(),
                                        }}
                                        animate={{
                                            opacity: isActive(index) ? 1 : 0.7,
                                            scale: isActive(index) ? 1 : 0.95,
                                            z: isActive(index) ? 0 : -100,
                                            rotate: isActive(index) ? 0 : randomRotateY(),
                                            zIndex: isActive(index)
                                                ? 40
                                                : testimonials.length + 2 - index,
                                            y: isActive(index) ? [0, -80, 0] : 0,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            scale: 0.9,
                                            z: 100,
                                            rotate: randomRotateY(),
                                        }}
                                        transition={{
                                            duration: 0.4,
                                            ease: "easeInOut",
                                        }}
                                        style={styles.motionDiv}>

                                        <img
                                            src={testimonial.src}
                                            alt={testimonial.name}
                                            width={500}
                                            height={500}
                                            draggable={false}
                                            style={styles.img} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                    <div style={styles.rightCol}>
                        <motion.div
                            key={active}
                            initial={{
                                y: 20,
                                opacity: 0,
                            }}
                            animate={{
                                y: 0,
                                opacity: 1,
                            }}
                            exit={{
                                y: -20,
                                opacity: 0,
                            }}
                            transition={{
                                duration: 0.2,
                                ease: "easeInOut",
                            }}>
                            <h3 style={styles.name} ref={featureRef1}>
                                {testimonials[active].name}
                            </h3>
                            <motion.p style={styles.quote}>
                                {testimonials[active].quote.split(" ").map((word, index) => (
                                    <motion.span
                                        key={index}
                                        initial={{
                                            filter: "blur(10px)",
                                            opacity: 0,
                                            y: 5,
                                        }}
                                        animate={{
                                            filter: "blur(0px)",
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        transition={{
                                            duration: 0.2,
                                            ease: "easeInOut",
                                            delay: 0.02 * index,
                                        }}
                                        style={styles.span}>
                                        {word}&nbsp;
                                    </motion.span>
                                ))}
                            </motion.p>
                        </motion.div>
                        <div style={styles.buttonRow}>
                            <button className="FeatureArrow"
                                onClick={handlePrev}
                                style={styles.button}
                                onMouseEnter={(e) => (e.currentTarget.firstChild.style.transform = "rotate(12deg)")}
                                onMouseLeave={(e) => (e.currentTarget.firstChild.style.transform = "rotate(0deg)")}>
                                <FontAwesomeIcon icon={faArrowLeft}
                                    style={styles.icon} />
                            </button>
                            <button className="FeatureName"
                                onClick={handleNext}
                                style={styles.button}
                                onMouseEnter={(e) => (e.currentTarget.firstChild.style.transform = "rotate(-12deg)")}
                                onMouseLeave={(e) => (e.currentTarget.firstChild.style.transform = "rotate(0deg)")}>
                                <FontAwesomeIcon icon={faArrowRight}
                                    style={styles.icon} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
