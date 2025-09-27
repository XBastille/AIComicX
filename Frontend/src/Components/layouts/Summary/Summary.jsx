import React, { useEffect, useRef, useState } from "react";
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { windowlistner } from "../../common/WindowListener/WindowListener";
// import SummaryImg1 from "../../Picture/summaryimg1.png";
// import SummaryImg2 from "../../Picture/summaryimg2.png";

gsap.registerPlugin(ScrollTrigger);

function Body() {
  const [position, setposition] = useState({ x: 0, y: 0 });

  // refs for scramble words + heading
  const cakeRef = useRef(null);
  const tooRef = useRef(null);
  const headingRef = useRef(null);

  // custom cursor tracking
  windowlistner('pointermove', (e) => {
    setposition({ x: e.clientX, y: e.clientY });
  });

  // --- Scramble utility (rAF-based, reliable in React) ---
  const scrambleTo = (el, finalText, opts = {}) => {
    if (!el) return;
    const {
      duration = 1.6, // seconds
      delay = 0,      // seconds
      charset = "!<>-_\\/[]{}—=+*^?#1234567890@$%&*"
    } = opts;

    const letters = finalText.split("");
    let start = null;

    // ensure we start with same length so layout doesn't jump
    el.textContent = letters.map(() => charset[Math.floor(Math.random() * charset.length)]).join("");

    const randomChar = () => charset[Math.floor(Math.random() * charset.length)];

    const step = (ts) => {
      if (start === null) start = ts;
      const t = (ts - start) / 1000 - delay;
      const p = Math.max(0, Math.min(1, t / duration)); // 0..1

      // progressively reveal letters across the duration
      const out = letters.map((ch, i) => {
        // spread reveal thresholds from 0.2..0.95 to make it feel organic
        const revealAt = 0.2 + (i / Math.max(1, letters.length - 1)) * 0.75;
        return p >= revealAt ? ch : randomChar();
      }).join("");

      el.textContent = out;

      if (p < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  // Re-trigger scramble whenever heading enters viewport (down or up)
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: headingRef.current,
      start: "top 80%",
      onEnter: () => {
        scrambleTo(cakeRef.current, "CAKE");
        scrambleTo(tooRef.current, "TOO");
      },
      onEnterBack: () => {
        scrambleTo(cakeRef.current, "CAKE");
        scrambleTo(tooRef.current, "TOO");
      }
    });

    return () => trigger && trigger.kill();
  }, []);

  // GSAP scroll animations for images + vertical line
  useGSAP(() => {
    gsap.fromTo(".left-img",
      { x: "-20%" },
      {
        x: "0%",
        scrollTrigger: {
          trigger: ".split-section",
          start: "top 20%",
          end: "bottom 90%",
          scrub: true
        }
      }
    );

    gsap.fromTo(".right-img",
      { x: "20%" },
      {
        x: "0%",
        scrollTrigger: {
          trigger: ".split-section",
          start: "top 20%",
          end: "bottom 90%",
          scrub: true
        }
      }
    );

    gsap.fromTo(".vertical-line",
      { scaleY: 0, transformOrigin: "top center" },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".split-section",
          start: "top 90%",
          end: "bottom 90%",
          scrub: true
        }
      }
    );
  });

  return (
    <div style={styles.maindiv}>
      {/* Custom Cursor */}
      <div
        className="cursor"
        style={{
          ...styles.cursor,
          transform: `translate(${position.x}px, ${position.y}px)`
        }}
      />

      {/* Split Section */}
      <div className="split-section" style={styles.splitSection}>
        <div style={styles.splitTextContainer}>
          <h1 ref={headingRef} style={styles.splitHeading}>
            HAVE YOUR <span ref={cakeRef}>CAKE</span> <br /> AND EAT IT <span ref={tooRef}>TOO</span>.
          </h1>
          <p style={styles.splitSubtext}>
            AI-DRIVEN COMIC CREATION THAT’S FAST, FLEXIBLE, AND FUN.
          </p>
        </div>

        {/* <div
          className="left-img"
          style={{ ...styles.splitImage, backgroundImage: `url(${SummaryImg1})` }}
        /> */}
        <div className="vertical-line" style={styles.verticalLine} />
        {/* <div
          className="right-img"
          style={{ ...styles.splitImage, backgroundImage: `url(${SummaryImg2})` }}
        /> */}
      </div>
    </div>
  );
}

const styles = {
  maindiv: {
    overflowX: "hidden"
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
  },
  splitSection: {
    position: 'relative',
    marginTop: '300px',
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    width: "100%",
  },
  splitTextContainer: {
    position: "absolute",
    top: "5%",
    textAlign: "center",
    color: "white",
    zIndex: 20
  },
  splitHeading: {
    fontSize: "48px",
    fontWeight: "bold",
    marginBottom: "10px",
    background: "linear-gradient(to right,rgb(223, 30, 114),rgb(230, 110, 41),rgb(255, 191, 0))",
    color: "transparent",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    marginTop: "-35%",
    fontFamily: "'Orbitron', sans-serif",
  },
  splitSubtext: {
    fontSize: "20px",
    fontWeight: "300",
    opacity: 0.85,
    fontFamily: "'Orbitron', sans-serif",
  },
  splitImage: {
    width: "80%",
    height: "82%",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  verticalLine: {
    width: "3px",
    height: "103%",
    backgroundColor: "#d72b59",
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%) scaleY(0)",
    zIndex: 10
  }
};

export default Body;
