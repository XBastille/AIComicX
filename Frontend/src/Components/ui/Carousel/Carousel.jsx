import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Carousel.css';

import auth1 from '../../..//Picture/auth.png';
import auth2 from '../../../Picture/auth2.png';
import auth3 from '../../../Picture/auth3.png';
import auth4 from '../../../Picture/auth4.png';

const Carousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showBubbles, setShowBubbles] = useState(false);

    const speechBubbles = {
        0: [
            {
                x: 555,
                y: 192,
                text: "Break time?",
                tailDirection: "down",
                width: 120,
                height: 60,
                tailPosition: 50,
                tailRotation: 0
            },
            {
                x: 350,
                y: 63,
                text: "I'm so lost.",
                tailDirection: "down",
                width: 120,
                height: 70,
                tailPosition: 70,
                tailRotation: -15
            },
            {
                x: 140,
                y: 20,
                text: "No, look. It's this formula.",
                tailDirection: "down",
                width: 140,
                height: 100,
                tailPosition: 50,
                tailRotation: 0
            }
        ],
        1: [
            {
                x: 149,
                y: 84,
                text: "This client is impossible!",
                tailDirection: "down",
                width: 150,
                height: 100,
                tailPosition: 70,
                tailRotation: -20
            },
            {
                x: 357,
                y: 5,
                text: "Easy, Tanaka-san, Calm down and eat.",
                tailDirection: "down",
                width: 160,
                height: 115,
                tailPosition: 50,
                tailRotation: 0
            },
            {
                x: 530,
                y: 295,
                text: "Haha, youthful passion.",
                tailDirection: "up",
                width: 130,
                height: 90,
                tailPosition: 45,
                tailRotation: 5
            }
        ],
        2: [
            {
                x: 504,
                y: 89,
                text: "A crack? Are you serious?",
                tailDirection: "down",
                width: 150,
                height: 95,
                tailPosition: 50,
                tailRotation: 0
            },
            {
                x: 207,
                y: 20,
                text: "Here's the problem. It's cracked.",
                tailDirection: "down",
                width: 140,
                height: 90,
                tailPosition: 50,
                tailRotation: 0
            }
        ],
        3: [
            {
                x: 321,
                y: 57,
                text: "It already smells amazing!",
                tailDirection: "down",
                width: 140,
                height: 90,
                tailPosition: 29,
                tailRotation: 18
            },
            {
                x: 477,
                y: 44,
                text: "Hey, I'm getting the hang of this!",
                tailDirection: "down",
                width: 180,
                height: 110,
                tailPosition: 55,
                tailRotation: 0
            }
        ]
    };

    const images = [
        { id: 1, src: auth1 },
        { id: 2, src: auth2 },
        { id: 3, src: auth3 },
        { id: 4, src: auth4 }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [images.length]);

    useEffect(() => {
        setShowBubbles(false);
        const timer = setTimeout(() => {
            setShowBubbles(true);
        }, 600);

        return () => clearTimeout(timer);
    }, [currentIndex]);

    return (
        <div className="carousel-container">
            <div className="carousel-wrapper">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        className="carousel-slide"
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -300 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                        <img
                            src={images[currentIndex].src}
                            alt={`Comic scene ${currentIndex + 1}`}
                            className="carousel-image"
                        />

                        {showBubbles && speechBubbles[currentIndex] && speechBubbles[currentIndex].map((bubble, index) => (
                            <div
                                key={index}
                                className={`speech-bubble animate-in`}
                                style={{
                                    left: `${bubble.x}px`,
                                    top: `${bubble.y}px`,
                                    transform: bubble.tailDirection === "up"
                                        ? 'translate(-50%, -100%)'
                                        : 'translate(-50%, -120%)',
                                    animationDelay: `${index * 0.2}s`
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
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Carousel;