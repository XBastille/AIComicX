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

    let ticking = false;
    let sectionTop = 0;
    let sectionHeight = 0;
    const distances = [-600, 1000, -1000, -600];

    const recalc = () => {
      const rect = sectionEl.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      sectionHeight = rect.height;
    };

    const clamp = (v, min, max) => v < min ? min : v > max ? max : v;

    const update = () => {
      ticking = false;
      const scrollY = window.scrollY;
      const viewportH = window.innerHeight;
      const start = sectionTop - viewportH;
      const end = sectionTop + sectionHeight;
      const raw = (scrollY - start) / (end - start);
      const progress = clamp(raw, 0, 1);

      colRefs.forEach((ref, idx) => {
        const el = ref.current;
        if (!el) return;
        const dy = distances[idx] * progress;
        el.style.transform = `translate3d(0, ${dy}px, 0)`;
      });
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    const onResize = () => {
      recalc();
      update();
    };

    recalc();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [targetRef]);

  return (
    <div style={styles.skiperArea}>
      <div style={styles.skiperInner}>
        {colRefs.map((ref, idx) => (
          <div
            key={idx}
            ref={ref}
            style={styles.col}
            className={`col-${idx + 1}`}
          >
            {[0, 1, 2].map(i => (
              <div key={i} style={styles.imgWrap}>
                <img
                  src={imgs[(idx * 3 + i) % imgs.length]}
                  alt="gallery"
                  style={styles.img}
                  loading={idx > 1 ? 'lazy' : 'eager'}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Summary() {
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const h1Ref = useRef(null);
  const h2Ref = useRef(null);

  const { scrollYProgress: s1 } = useScroll({
    target: section1Ref,
    offset: ["start end", "end start"],
  });
  const s1Y = useTransform(s1, [0, 1], [40, -40]);
  const s1Scale = useTransform(s1, [0, 1], [0.8, 1.06]);
  const s1Letter = useTransform(s1, [0, 1], [0, 3]);

  const { scrollYProgress: s2 } = useScroll({
    target: section2Ref,
    offset: ["start end", "end start"],
  });
  const s2Y = useTransform(s2, [0, 1], [40, -40]);
  const s2Scale = useTransform(s2, [0, 1], [0.8, 1.06]);
  const s2Letter = useTransform(s2, [0, 1], [0, 3]);

  const useScrambleOnScroll = (elRef, triggerRef) => {
    useEffect(() => {
      const el = elRef.current;
      const trigger = triggerRef.current;
      if (!el || !trigger) return;
      const lineSpans = Array.from(el.querySelectorAll('.summary-line'));
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
      const scrambleLine = (span, duration = 0.45) => {
        const textNodes = [];
        const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT, null);
        let tn;
        while ((tn = walker.nextNode())) if (tn.nodeValue.trim().length) textNodes.push(tn);
        textNodes.forEach(node => {
          const original = node.nodeValue;
          const len = original.length;
          const frames = Math.ceil(duration * 60);
          let frame = 0;
          const tick = () => {
            const progress = frame / frames;
            const reveal = Math.floor(progress * len);
            let out = '';
            for (let i = 0; i < len; i++) {
              out += i < reveal ? original[i] : chars[(i + frame * 13) % chars.length];
            }
            node.nodeValue = out;
            frame++;
            if (frame <= frames) requestAnimationFrame(tick); else node.nodeValue = original;
          };
          tick();
        });
      };
      const onEnter = () => {
        gsap.fromTo(el, { scale: 0.92, opacity: 0.9 }, { scale: 1, opacity: 1, duration: 0.55, ease: 'power3.out' });
        lineSpans.forEach((span, idx) => setTimeout(() => scrambleLine(span, 0.45), idx * 90));
      };
      const st = ScrollTrigger.create({ trigger, start: 'top 75%', once: true, onEnter });
      return () => st.kill();
    }, [elRef, triggerRef]);
  };

  useScrambleOnScroll(h1Ref, section1Ref);
  useScrambleOnScroll(h2Ref, section2Ref);
  return (
    <div style={styles.wrap}>
      <section ref={section1Ref} style={styles.fullscreenDark}>
        <motion.h1
          ref={h1Ref}
          style={{ ...styles.headline, y: s1Y, scale: s1Scale, letterSpacing: s1Letter }}
          aria-label="Turn your ideas into comics in seconds."
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
        >
          <span className="summary-line" style={styles.line}>TURN YOUR</span>
          <span className="summary-line" style={styles.line}>IDEAS INTO</span>
          <span className="summary-line" style={styles.line}><span style={styles.gradientText}>COMIC</span> IN</span>
          <span className="summary-line" style={styles.line}>SECONDS</span>
        </motion.h1>
      </section>

      <div style={styles.sectionGap} />

      <section ref={section2Ref} style={styles.fullscreenRelative}>
        <div style={styles.skiperBg}><ColumnsParallax targetRef={section2Ref} /></div>
        <div style={styles.overlay} />
        <motion.h2
          ref={h2Ref}
          style={{ ...styles.headline, position: 'absolute', inset: 0, margin: 0, y: s2Y, scale: s2Scale, letterSpacing: s2Letter }}
          aria-label="Create any genre. Any style. All you."
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
        >
          <span className="summary-line" style={styles.line}>CREATE ANY GENRE</span>
          <span className="summary-line" style={styles.line}>ANY STYLE</span>
          <span className="summary-line" style={styles.line}>ALL <span style={styles.gradientText}>YOU</span></span>
        </motion.h2>
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
    height: "120vh",
    width: "100%",
    position: "relative",
    overflow: "hidden",
    background: "rgb(31, 22, 35)",
  },
  skiperBg: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
  },
  skiperArea: {
    position: "absolute",
    inset: 0,
    background: "rgb(31, 22, 35)",
  },
  skiperInner: {
    position: "absolute",
    inset: 0,
    display: "flex",
    gap: "2vw",
    padding: "2vw",
  },
  col: {
    position: "relative",
    top: "-45%",
    height: "175%",
    width: "25%",
    minWidth: 250,
    display: "flex",
    flexDirection: "column",
    gap: "2vw",
    willChange: 'transform'
  },
  imgWrap: {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    borderRadius: 12,
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
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
  headline: {
    zIndex: 2,
    textAlign: "center",
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 800,
    lineHeight: 1,
    fontSize: "clamp(2.5rem, 10vw, 11rem)",
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
  style.innerHTML = `@keyframes gradientShift {0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`;
  document.head.appendChild(style);
}
