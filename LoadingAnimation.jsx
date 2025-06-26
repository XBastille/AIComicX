import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './LoadingAnimation.css';

const LoadingAnimation = ({ onComplete }) => {
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);
  const progressFillRef = useRef(null);
  const percentageRef = useRef(null);
  const petalsRef = useRef([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const progressBar = progressBarRef.current;
    const progressFill = progressFillRef.current;
    const percentage = percentageRef.current;

    // Set initial states
    gsap.set(container, { opacity: 0 });
    gsap.set(progressBar, { scale: 0.8, opacity: 0 });
    
    // Set petals initial positions (spread across screen)
    petalsRef.current.forEach((petal, index) => {
      if (petal) {
        gsap.set(petal, { 
          opacity: 0, 
          y: -200, // Start above screen
          x: Math.random() * window.innerWidth, // Random X position
          scale: 0.5 + Math.random() * 0.5 // Random scale
        });
      }
    });

    // Create timeline
    const tl = gsap.timeline();

    // Fade in container
    tl.to(container, {
      opacity: 1,
      duration: 0.8,
      ease: "power2.out"
    });

    // Animate progress bar appearance
    tl.to(progressBar, {
      scale: 1,
      opacity: 1,
      duration: 1,
      ease: "back.out(1.7)"
    }, "-=0.3");

    // Animate petals falling from top
    tl.to(petalsRef.current, {
      opacity: 1,
      y: (index) => Math.random() * window.innerHeight * 0.8, // Fall to random Y positions
      duration: 2,
      stagger: {
        amount: 1,
        from: "random"
      },
      ease: "power2.out"
    }, "-=0.5");

    // Start progress animation
    tl.call(() => {
      animateProgress();
      animatePetals();
    });

    return () => {
      tl.kill();
    };
  }, []);

  const animateProgress = () => {
    const duration = 4; // 4 seconds loading time
    
    gsap.to({}, {
      duration: duration,
      ease: "power2.inOut",
      onUpdate: function() {
        const currentProgress = Math.round(this.progress() * 100);
        setProgress(currentProgress);
        
        // Animate progress fill
        gsap.set(progressFillRef.current, {
          width: `${currentProgress}%`
        });
        
        // Animate percentage text
        if (percentageRef.current) {
          percentageRef.current.textContent = `${currentProgress}%`;
        }
        
        // Progress bar glow intensity
        const glowIntensity = currentProgress / 100;
        gsap.set(progressFillRef.current, {
          filter: `drop-shadow(0 0 ${10 + glowIntensity * 20}px rgba(223, 30, 114, ${0.5 + glowIntensity * 0.5}))`
        });
      },
      onComplete: () => {
        // Complete animation
        setTimeout(() => {
          exitAnimation();
        }, 500);
      }
    });
  };

  const animatePetals = () => {
    petalsRef.current.forEach((petal, index) => {
      if (petal) {
        // Continuous floating animation
        gsap.to(petal, {
          y: `+=${Math.random() * 40 - 20}`, // Float up and down
          x: `+=${Math.random() * 60 - 30}`, // Float left and right
          rotation: `+=${Math.random() * 360}`,
          duration: 3 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 2
        });
        
        // Subtle scale animation
        gsap.to(petal, {
          scale: 0.8 + Math.random() * 0.4,
          duration: 2 + Math.random() * 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 1
        });
      }
    });
  };

  const exitAnimation = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    // Petals swirl up
    tl.to(petalsRef.current, {
      y: -300,
      x: "+=100",
      rotation: "+=720",
      scale: 0,
      opacity: 0,
      duration: 1.5,
      stagger: {
        amount: 0.5,
        from: "random"
      },
      ease: "power2.in"
    });

    // Progress bar final glow and fade
    tl.to(progressBarRef.current, {
      scale: 1.1,
      opacity: 0,
      duration: 1,
      ease: "power2.inOut"
    }, "-=1");

    // Container fade out
    tl.to(containerRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut"
    }, "-=0.5");
  };

  // Generate petal positions (remove CSS positioning since GSAP handles it)
  const generatePetals = () => {
    const petals = [];
    for (let i = 0; i < 15; i++) {
      petals.push({}); // Empty object since positioning is handled by GSAP
    }
    return petals;
  };

  const petalStyles = generatePetals();

  return (
    <div ref={containerRef} className="loading-container">
      {/* Animated background */}
      <div className="animated-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Floating particles */}
      <div className="floating-particles">
        {[...Array(25)].map((_, i) => (
          <div key={i} className={`particle particle-${i}`}></div>
        ))}
      </div>

      {/* Sakura petals */}
      <div className="sakura-container">
        {petalStyles.map((style, index) => (
          <div
            key={index}
            ref={el => petalsRef.current[index] = el}
            className="sakura-petal"
          >
            🌸
          </div>
        ))}
      </div>

      {/* Progress section */}
      <div className="progress-section">
        <div className="loading-title">
          <span className="loading-text">Loading</span>
          <div className="dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
        </div>
        
        <div ref={progressBarRef} className="progress-bar-container">
          <div className="progress-bar">
            <div ref={progressFillRef} className="progress-fill"></div>
            <div className="progress-shine"></div>
          </div>
          <div ref={percentageRef} className="percentage">0%</div>
        </div>
      </div>

      {/* Aurora effect */}
      <div className="aurora">
        <div className="aurora-line line-1"></div>
        <div className="aurora-line line-2"></div>
        <div className="aurora-line line-3"></div>
      </div>
    </div>
  );
};

export default LoadingAnimation;