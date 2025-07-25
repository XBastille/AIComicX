import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './LoadingAnimation.css';
import loadingVideo from '../../Picture/loading.mp4';
import aicomicLogo from '../../Picture/aicomic2.jpg';
import epochPresents from '../../Picture/Epoch_Present.png';

const LoadingAnimation = ({ onComplete }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const progressFillRef = useRef(null);
  const percentageRef = useRef(null);
  const brandingRef = useRef(null);
  const verticalLineRef = useRef(null);
  const epochRef = useRef(null);
  const aicomicRef = useRef(null);
  const speechBubbleRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [currentDialogue, setCurrentDialogue] = useState('');

  const dialogues = [
    "Our Journey Awaits",
    "Ready for Adventure?",
    "Let's Create Magic!"
  ];

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    const branding = brandingRef.current;
    const verticalLine = verticalLineRef.current;
    const epoch = epochRef.current;
    const aicomic = aicomicRef.current;
    const speechBubble = speechBubbleRef.current;

    const randomDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    setCurrentDialogue(randomDialogue);

    gsap.set(container, { opacity: 0 });
    gsap.set(progressBar, { y: 50, opacity: 0 });
    gsap.set(branding, { opacity: 0 });
    gsap.set(verticalLine, { scaleY: 0, transformOrigin: "top center" });
    
    gsap.set(epoch, { x: 0, opacity: 0, scale: 0.5 }); 
    gsap.set(aicomic, { x: 0, opacity: 0, scale: 0.5 }); 
    
    gsap.set(speechBubble, { scale: 0, opacity: 0 });

    const tl = gsap.timeline();

    tl.to(container, {
      opacity: 1,
      duration: 0.8,
      ease: "power2.out"
    });

    tl.to(branding, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.3");

    tl.to(verticalLine, {
      scaleY: 1,
      duration: 1.2,
      ease: "power2.out"
    }, "-=0.2");

    tl.to(epoch, {
      x: -140, 
      opacity: 1,
      scale: 1,
      duration: 1.2,
      ease: "back.out(1.7)"
    }, "-=0.2")
    
    .to(aicomic, {
      x: 140, 
      opacity: 1,
      scale: 1,
      duration: 1.2,
      ease: "back.out(1.7)"
    }, "<"); 

    tl.to(progressBar, {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "back.out(1.7)"
    }, "-=0.5");

    tl.to(speechBubble, {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      ease: "back.out(2)",
    }, "+=0.5");

    tl.call(() => {
      if (video) {
        video.play();
      }
      animateProgress();
    });

    return () => {
      tl.kill();
    };
  }, []);

  const animateProgress = () => {
    const duration = 4; 
    
    gsap.to({}, {
      duration: duration,
      ease: "power2.inOut",
      onUpdate: function() {
        const currentProgress = Math.round(this.progress() * 100);
        setProgress(currentProgress);
        
        gsap.set(progressFillRef.current, {
          width: `${currentProgress}%`
        });
        
        if (percentageRef.current) {
          percentageRef.current.textContent = `${currentProgress}%`;
        }
        
        const glowIntensity = currentProgress / 100;
        gsap.set(progressFillRef.current, {
          filter: `drop-shadow(0 0 ${15 + glowIntensity * 25}px rgba(223, 30, 114, ${0.6 + glowIntensity * 0.4}))`
        });
      },
      onComplete: () => {
        setTimeout(() => {
          exitAnimation();
        }, 500);
      }
    });
  };

  const exitAnimation = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    tl.to(speechBubbleRef.current, {
      scale: 0,
      opacity: 0,
      duration: 0.4,
      ease: "back.in(2)"
    });

    tl.to(progressBarRef.current, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power2.in"
    }, "-=0.2");

    tl.to(brandingRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.in"
    }, "-=0.6");

    tl.to(containerRef.current, {
      opacity: 0,
      duration: 1,
      ease: "power2.inOut"
    }, "-=0.4");
  };

  return (
    <div ref={containerRef} className="loading-container">
      <div className="video-wrapper">
        <video 
          ref={videoRef}
          className="background-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={loadingVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div 
          ref={speechBubbleRef}
          className="speech-bubble"
          style={{
            left: '31%',
            top: '57%'
          }}
        >
          <div className="speech-bubble-content">
            {currentDialogue}
          </div>
          <div className="speech-bubble-tail"></div>
        </div>
      </div>

      <div ref={brandingRef} className="branding-container">
        <div ref={verticalLineRef} className="vertical-line"></div>
        
        <div ref={epochRef} className="epoch-container">
          <img src={epochPresents} alt="EPOCH PRESENTS" className="epoch-logo" />
        </div>
        
        <div ref={aicomicRef} className="aicomic-container">
          <img src={aicomicLogo} alt="AIComicX" className="aicomic-logo" />
        </div>
      </div>

      <div className="bottom-section">
        <div ref={progressBarRef} className="progress-section">          
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div ref={progressFillRef} className="progress-fill"></div>
              <div className="progress-shine"></div>
            </div>
            <div ref={percentageRef} className="percentage">0%</div>
          </div>
        </div>

        <div className="floating-particles">
          {[...Array(15)].map((_, i) => (
            <div key={i} className={`particle particle-${i}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;