import React, { useMemo, useRef, useEffect } from "react";
import land from '../../Picture/land.png';
import land2 from '../../Picture/land_2.png';
import land3 from '../../Picture/land_3.png';
import land4 from '../../Picture/land_4.png';
import land5 from '../../Picture/land_5.png';
import land6 from '../../Picture/land_6.png';
import land7 from '../../Picture/land_7.png';
import land8 from '../../Picture/land_8.png';
import land9 from '../../Picture/land_9.png';
import land10 from '../../Picture/land_10.png';
import land11 from '../../Picture/land_11.png';
import land12 from '../../Picture/land_12.png';
import land14 from '../../Picture/land_14.png';
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

if (typeof window !== "undefined" && !gsap.core.globals()._summaryGsapReg) {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
  gsap.core.globals("_summaryGsapReg", true);
}


const galleryImages = [
  land, land2, land3, land4, land5, land6, land7,
  land8, land9, land10, land11, land12, land14
];

function ColumnsParallax({ targetRef }) {
  const colRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const imgs = galleryImages;

  useEffect(() => {
    const sectionEl = targetRef.current;
    if (!sectionEl) return;

    colRefs.forEach((ref) => {
      if (ref.current) {
        gsap.set(ref.current, { clearProps: "all" });
      }
    });

    const ctx = gsap.context(() => {
      colRefs.forEach((ref, idx) => {
        if (!ref.current) return;
        
        const direction = idx % 2 === 0 ? -1 : 1; 
        
        const distance = (idx === 0 || idx === 3) 
          ? direction * 150  
          : direction * 500;
        
        const scrubSpeed = (idx === 0 || idx === 3)
          ? 2     
          : 0.25; 
        
        gsap.to(ref.current, {
          y: distance,
          ease: "none",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top bottom",
            end: "bottom top",
            scrub: scrubSpeed,
            invalidateOnRefresh: true,
          }
        });
      });
    }, sectionEl);

    return () => {
      ctx.revert(); 
    };
  }, []);

  return (
    <div style={styles.skiperArea}>
      <div style={styles.skiperInner}>
        {colRefs.map((ref, idx) => {
          const isUpColumn = idx % 2 === 1;
          const columnStyle = {
            ...styles.col,
            top: isUpColumn ? "-120%" : "-20%", 
          };
          
          return (
            <div
              key={idx}
              ref={ref}
              style={columnStyle}
              className={`col-${idx + 1}`}
            >
              {/* Show 20 images per column for true infinite effect */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(i => {
                const imgIndex = (idx * 5 + i) % imgs.length; 
                return (
                  <div key={i} style={styles.imgWrap}>
                    <img
                      src={imgs[imgIndex]}
                      alt={`gallery-${imgIndex + 1}`}
                      style={styles.img}
                      loading={idx > 1 ? 'lazy' : 'eager'}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Summary() {
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const h1Ref = useRef(null);
  const h2Ref = useRef(null);

  useEffect(() => {
    const h1 = h1Ref.current;
    if (!h1) return;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const spans = h1.querySelectorAll('.scramble-text');
    
    spans.forEach((span, index) => {
      const originalText = span.textContent;
      const textLength = originalText.length;
      
      gsap.fromTo(span,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.05,
          delay: index * 0.08,
          scrollTrigger: {
            trigger: section1Ref.current,
            start: 'top 80%',
            once: true,
          },
          onStart: () => {
            let iterations = 0;
            const maxIterations = textLength * 2;
            
            const interval = setInterval(() => {
              span.textContent = originalText
                .split('')
                .map((char, charIndex) => {
                  if (char === ' ') return ' ';
                  if (charIndex < iterations / 2) return originalText[charIndex];
                  return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');
              
              iterations++;
              if (iterations >= maxIterations) {
                clearInterval(interval);
                span.textContent = originalText;
              }
            }, 30);
          }
        }
      );
    });
  }, []);

  useEffect(() => {
    const h2 = h2Ref.current;
    const section = section2Ref.current;
    if (!h2 || !section) return;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const spans = h2.querySelectorAll('.scramble-text');
    
    spans.forEach((span, index) => {
      const originalText = span.textContent;
      const textLength = originalText.length;
      
      gsap.fromTo(span,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.05,
          delay: index * 0.08,
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            once: true,
          },
          onStart: () => {
            let iterations = 0;
            const maxIterations = textLength * 2;
            
            const interval = setInterval(() => {
              span.textContent = originalText
                .split('')
                .map((char, charIndex) => {
                  if (char === ' ') return ' ';
                  if (charIndex < iterations / 2) return originalText[charIndex];
                  return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');
              
              iterations++;
              if (iterations >= maxIterations) {
                clearInterval(interval);
                span.textContent = originalText;
              }
            }, 30);
          }
        }
      );
    });

    ScrollTrigger.create({
      trigger: h2,
      start: "center center", 
      end: () => `+=${section.offsetHeight - window.innerHeight}`, 
      pin: h2,
      pinSpacing: false,
      invalidateOnRefresh: true,
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === section) st.kill();
      });
    };
  }, []);
  return (
    <div style={styles.wrap}>
      <section ref={section1Ref} style={styles.fullscreenDark}>
        <h1 ref={h1Ref} style={styles.headline}>
          <span style={styles.line}><span className="scramble-text">TURN YOUR</span></span>
          <span style={styles.line}><span className="scramble-text">IDEAS INTO</span></span>
          <span style={styles.line}><span className="scramble-text gradient-text">COMIC</span> <span className="scramble-text">IN</span></span>
          <span style={styles.line}><span className="scramble-text">SECONDS</span></span>
        </h1>
      </section>

      <div style={styles.sectionGap} />

      <section ref={section2Ref} style={styles.fullscreenRelative}>
        <div style={styles.skiperBg}><ColumnsParallax targetRef={section2Ref} /></div>
        <div style={styles.overlay} />
        <h2 ref={h2Ref} style={styles.galleryHeadline}>
          <span style={styles.line}><span className="scramble-text">CREATE ANY GENRE</span></span>
          <span style={styles.line}><span className="scramble-text">ANY STYLE</span></span>
          <span style={styles.line}><span className="scramble-text">ALL</span> <span className="scramble-text gradient-text">YOU</span></span>
        </h2>
      </section>
    </div>
  );
}

const styles = {
  wrap: {
    width: "100%",
    overflow: "hidden",
  },
  fullscreenDark: {
    height: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: '22vh',
    background: "rgb(31, 22, 35)",
    position: "relative",
  },
  sectionGap: {
    height: "20vh",
    width: "100%",
  },
  fullscreenRelative: {
    height: "250vh",
    width: "100%",
    position: "relative",
    overflow: "hidden",
    background: "rgb(31, 22, 35)",
  },
  skiperBg: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    overflow: "hidden", 
  },
  skiperArea: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%", 
    height: "100%", 
    background: "rgb(31, 22, 35)",
  },
  skiperInner: {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    gap: "1.5vw", 
    padding: "0 1.5vw", 
  },
  col: {
    position: "relative",
    height: "auto", 
    width: "25%",
    display: "flex",
    flexDirection: "column",
    gap: "0",
    willChange: 'transform',
    transform: 'translate3d(0, 0, 0)', 
    paddingBottom: "100vh", 
    paddingTop: "50vh", 
  },
  imgWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: "3/4",
    overflow: "hidden",
    borderRadius: "8px",
    boxShadow: "0 10px 30px -5px rgba(0,0,0,0.5)",
    flex: "0 0 auto",
    marginBottom: "40px", 
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(31,22,35,0.45) 0%, rgba(31,22,35,0.35) 50%, rgba(31,22,35,0.75) 100%)",
    zIndex: 1,
    pointerEvents: "none",
  },
  galleryHeadline: {
    position: "absolute",
    top: "15vh", 
    left: "0",
    right: "0",
    zIndex: 2,
    pointerEvents: "none",
    textAlign: "center",
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 800,
    lineHeight: 1,
    fontSize: "clamp(3.5rem, 11vw, 13rem)",
    margin: "0 auto",
    padding: "0 4vw",
    color: "#ffffff",
    textShadow: "0 0 28px rgba(255,255,255,0.12)",
    letterSpacing: 0,
    width: "auto",
    maxWidth: "90%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  headline: {
    zIndex: 2,
    textAlign: "center",
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 800,
    lineHeight: 1,
    fontSize: "clamp(3.5rem, 11vw, 13rem)", 
    margin: 0,
    padding: "0 4vw",
    color: "#ffffff",
    textShadow: "0 0 28px rgba(255,255,255,0.12)",
    letterSpacing: 0,
  },
  gradientText: {
    background:
      "linear-gradient(90deg, rgb(223,30,114), rgb(230,110,41), rgb(255,191,0), rgb(223,30,114))",
    backgroundSize: "300% 300%",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    animation: "gradientShift 6s ease-in-out infinite",
    textShadow: "0 0 22px rgba(255,191,0,0.15)",
  },
  line: {
    display: 'block',
    whiteSpace: 'nowrap'
  }
};

if (typeof document !== 'undefined' && !document.getElementById('summary-gradient-anim')) {
  const style = document.createElement('style');
  style.id = 'summary-gradient-anim';
  style.innerHTML = `
    @keyframes gradientShift {
      0%{background-position:0% 50%}
      50%{background-position:100% 50%}
      100%{background-position:0% 50%}
    }
    .scramble-text {
      display: inline-block;
    }
    .gradient-text {
      background: linear-gradient(90deg, rgb(223,30,114), rgb(230,110,41), rgb(255,191,0), rgb(223,30,114));
      background-size: 300% 300%;
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      animation: gradientShift 6s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}