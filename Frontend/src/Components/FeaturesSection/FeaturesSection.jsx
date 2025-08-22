import React, { useEffect, useRef } from "react";
import image from '../../Picture/auth2.png';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { color } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

function FeaturesSection() {
  const imageRef = useRef(null);
  const imageRef2 = useRef(null);
  const imageRef3 = useRef(null);

  const textRef = useRef(null);
  const textRef2 = useRef(null);
  const textRef3 = useRef(null);

  useEffect(() => {
    gsap.set([imageRef.current, imageRef3.current], {
      x: -80,
      opacity: 0,
      scale: 0.95,
      transformOrigin: "center center"
    });

    const createImageAnimation = (element) => {
      return gsap.fromTo(element,
        {
          x: -80,
          opacity: 0,
          scale: 0.95,
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 45%",
            end: "bottom 55%",
            toggleActions: "play reverse play reverse",
            scrub: false,
          }
        }
      );
    };

    gsap.set([imageRef2], {
      x: 80,
      opacity: 0,
      scale: 0.95,
      transformOrigin: "center center"
    });

    const createImageAnimationRight = (element) => {
      return gsap.fromTo(element,
        {
          x: 80,
          opacity: 0,
          scale: 0.95,
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 45%",
            end: "bottom 55%",
            toggleActions: "play reverse play reverse",
            scrub: false,
          }
        }
      );
    };

    const anim1 = createImageAnimation(imageRef.current);
    const anim2 = createImageAnimationRight(imageRef2.current);
    const anim3 = createImageAnimation(imageRef3.current);

    return () => {
      anim1.kill();
      anim2.kill();
      anim3.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);


  const featureRef1 = useRef(null);
  const featureRef2 = useRef(null);
  const featureRef3 = useRef(null);

  useEffect(() => {
    gsap.set([featureRef1.current, featureRef2.current, featureRef3.current], {
      y: -80,
      opacity: 0,
      scale: 0.95,
      transformOrigin: "center center"
    });

    const createImageAnimation = (element) => {
      return gsap.fromTo(element,
        {
          y: -80,
          opacity: 0,
          scale: 0.95,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 45%",
            end: "bottom 2%",
            toggleActions: "play reverse play reverse",
            scrub: false,
          }
        }
      );
    };

    const anim1 = createImageAnimation(featureRef1.current);
    const anim2 = createImageAnimation(featureRef2.current);
    const anim3 = createImageAnimation(featureRef3.current);

    return () => {
      anim1.kill();
      anim2.kill();
      anim3.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  useEffect(() => {
    gsap.set([featureRef1.current, featureRef2.current, featureRef3.current], {
      y: -80,
      opacity: 0,
      scale: 0.95,
      transformOrigin: "center center"
    });

    const createFeatureAnimation = (element) => {
      return gsap.fromTo(element,
        {
          y: -80,
          opacity: 0,
          scale: 0.95,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 45%",
            end: "bottom 2%",
            toggleActions: "play reverse play reverse",
            scrub: false,
          }
        }
      );
    };

    const anim1 = createFeatureAnimation(textRef.current);
    const anim2 = createFeatureAnimation(textRef2.current);
    const anim3 = createFeatureAnimation(textRef3.current);

    return () => {
      anim1.kill();
      anim2.kill();
      anim3.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);



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
        const totalDuration = 60;

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
    createScrambleAnimation(featureRef2.current);
    createScrambleAnimation(featureRef3.current);

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div>
      <h2 style={styles.heading}>What Amazing Things We Can Do</h2>
      <div className="ShowcaseArea" style={styles.ShowcaseArea}>

        <div className="" style={styles.firstCard}>
          <div ref={featureRef1} style={styles.featureHead}>
            <h2  >Feature 1</h2>
          </div>
          <div className="" style={styles.contentArea}>
            <div className="" style={{ ...styles.imgSide, ...styles.imageContainer }} ref={imageRef}>
              <img src={image} style={styles.imgStyle} />
            </div>
            <div className="" style={styles.txtSide} ref={textRef}>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam quaerat quis nobis, consequatur praesentium, repudiandae libero odit itaque minus sequi deleniti quia, velit voluptas. Ipsum fugiat aut modi dolores dolor?</p>
            </div>
          </div>
        </div>

        <div className="" style={styles.firstCard}>
          <div ref={featureRef2} style={styles.featureHead}>
            <h2 >Feature 2</h2>
          </div>
          <div className="" style={styles.contentArea}>
            <div className="" style={styles.txtSide} ref={textRef2}>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam quaerat quis nobis, consequatur praesentium, repudiandae libero odit itaque minus sequi deleniti quia, velit voluptas. Ipsum fugiat aut modi dolores dolor?</p>
            </div>
            <div className="" style={{ ...styles.imgSide, ...styles.imageContainer }} ref={imageRef2}>
              <img src={image} style={styles.imgStyle} />
            </div>

          </div>
        </div>

        <div className="" style={styles.firstCard}>
          <div ref={featureRef3} style={styles.featureHead}>
            <h2 >Feature 3</h2>
          </div>
          <div className="" style={styles.contentArea}>
            <div className="" style={{ ...styles.imgSide, ...styles.imageContainer }} ref={imageRef3}>
              <img src={image} style={styles.imgStyle} />
            </div>
            <div className="" style={styles.txtSide} ref={textRef3}>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam quaerat quis nobis, consequatur praesentium, repudiandae libero odit itaque minus sequi deleniti quia, velit voluptas. Ipsum fugiat aut modi dolores dolor?</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

const styles = {
  ShowcaseArea: {
    width: "90%",
    marginLeft: "5%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    marginTop: "50px",
    fontSize: "40px",
    background: "linear-gradient(to right,rgb(223, 30, 114),rgb(230, 110, 41),rgb(255, 191, 0))",
    color: "transparent",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",

  },
  firstCard: {
    marginTop: "50px",
    width: "80%",
    height: "100vh",
    // border: "2px solid white",
  },
  featureHead: {
    fontSize: "40px",
    marginTop: "50px",
    marginBottom: "10px",
    background: "linear-gradient(to right,rgb(223, 30, 114),rgb(230, 110, 41),rgb(255, 191, 0))",
    color: "transparent",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
  },
  contentArea: {
    marginTop: "50px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  imgSide: {
    width: "50%"
  },
  txtSide: {
    width: "50%",
    fontSize: "25px",
    padding: "0 30px",
    lineHeight: "1.6",

  },
  imageContainer: {
    overflow: "hidden",
    willChange: "transform",
  },
  imgStyle: {
    height: "450px",
    width: "90%",
    display: "block",
    borderRadius: "10px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
  }
}

export default FeaturesSection;