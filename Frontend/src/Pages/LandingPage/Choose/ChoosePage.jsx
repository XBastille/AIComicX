import React, { useEffect, useRef, useState } from "react";
import "./ChoosePage.css";
import narrationImage from "../../../Picture/nar.jpg";
import storyImage from "../../../Picture/story.jpg";
import sam from "../../../Picture/sam.png";
import { gsap } from "gsap";

function ChoosePage() {
    const headingRef = useRef(null);
    const headingWrapperRef = useRef(null);
    const energyBeamRef = useRef(null);
    const glitchLayerRef = useRef(null);
    const box1Ref = useRef(null);
    const box2Ref = useRef(null);
    const box3Ref = useRef(null);
    const containerRef = useRef(null);
    const [animationComplete, setAnimationComplete] = useState(false);
    
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

    return (
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

            <div ref={containerRef} className="Boxes">
                <div ref={box1Ref} className="Box1">
                    <div className="info-btn">i</div>
                    <div className="info-tooltip">
                        This option allows you to upload a dialogue-narration style story format.
                    </div>
                    <div className="image-container">
                        <img src={narrationImage} alt="Dialogue-Story Style" />
                    </div>
                    <p className="smallText">Dialogue-Story Style</p>
                </div>
                <div ref={box2Ref} className="Box2">
                    <div className="info-btn">i</div>
                    <div className="info-tooltip">
                        This option allows you to upload a normal style story format.
                    </div>
                    <div className="image-container">
                        <img src={storyImage} alt="Story" />
                    </div>
                    <p className="smallText">Story</p>
                </div>
                <div ref={box3Ref} className="Box3">
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
        </div>
    );
}

export default ChoosePage;
