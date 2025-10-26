import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

gsap.registerPlugin(ScrollTrigger);

const FAQ = () => {
    const [openItems, setOpenItems] = useState({});
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const faqRef = useRef(null);
    const headingLine1Ref = useRef(null);
    const headingLine2Ref = useRef(null);
    const containerRef = useRef(null);

    const faqData = [
        {
            id: 1,
            question: "What is AIComicX?",
            answer: "AIComicX is an innovative platform that transforms your creative ideas into stunning visual comic stories using cutting-edge artificial intelligence technology. Our platform combines storytelling with advanced AI to create personalized, professional-quality comics."
        },
        {
            id: 2,
            question: "How does the AI comic creation process work?",
            answer: "Simply provide your story concept, characters, and style preferences. Our AI analyzes your input and generates sequential comic panels with consistent characters, engaging dialogue, and professional artwork. You can then customize and refine the results to match your vision."
        },
        {
            id: 3,
            question: "Can I customize the comic art style?",
            answer: "Absolutely! AIComicX offers multiple art styles including manga, western comics, superhero, indie, and more. You can also adjust color palettes, character designs, and panel layouts to create your unique visual narrative."
        },
        {
            id: 4,
            question: "Is there a limit to story length?",
            answer: "Our platform supports various story lengths, from single-panel comics to multi-page adventures. Premium users enjoy extended story limits and can create full comic book series with consistent character development across episodes."
        },
        {
            id: 5,
            question: "Can I download and print my comics?",
            answer: "Yes! Once your comic is complete, you can download it in high-resolution formats suitable for both digital sharing and professional printing. We support various formats including PDF, PNG, and print-ready specifications."
        },
        {
            id: 6,
            question: "How much does AIComicX cost?",
            answer: "We offer flexible pricing plans including a free tier with basic features, and premium subscriptions that unlock advanced AI models, unlimited stories, commercial usage rights, and priority processing."
        }
    ];

    useEffect(() => {
        const handleMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('pointermove', handleMouseMove);
        return () => window.removeEventListener('pointermove', handleMouseMove);
    }, []);

    const toggleItem = (id) => {
        setOpenItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const scrambleText = (element, finalText, duration = 2) => {
        if (!element) return;
        
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        const letters = finalText.split("");
        let start = null;
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / (duration * 1000), 1);
            
            const scrambled = letters.map((char, index) => {
                const revealPoint = index / Math.max(letters.length - 1, 1);
                return progress >= revealPoint 
                    ? char 
                    : chars[Math.floor(Math.random() * chars.length)];
            }).join("");
            
            element.textContent = scrambled;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    };

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 60%",
                toggleActions: "play none none reverse"
            }
        });

        tl.fromTo([headingLine1Ref.current, headingLine2Ref.current],
            {
                y: 50,
                opacity: 0,
                scale: 0.9
            },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: "back.out(1.7)",
                stagger: 0.05
            }
        );

        tl.fromTo(".faq-item",
            {
                y: 30,
                opacity: 0,
                x: -20
            },
            {
                y: 0,
                opacity: 1,
                x: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out"
            },
            "-=0.3"
        );

    }, []);

    useGSAP(() => {
        const triggers = [
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: "top 60%",
                onEnter: () => {
                    scrambleText(headingLine1Ref.current, "FREQUENTLY ASKED", 2.0);
                    setTimeout(() => scrambleText(headingLine2Ref.current, "QUESTIONS", 1.8), 150);
                },
                once: true
            })
        ];

        return () => triggers.forEach(t => t.kill());
    }, []);

    return (
        <div style={styles.container} ref={containerRef}>
            <div
                className="cursor"
                style={{
                    ...styles.cursor,
                    transform: `translate(${position.x}px, ${position.y}px)`
                }}
            />

            <div style={styles.faqWrapper} ref={faqRef}>
                <h1 style={styles.mainHeading}>
                    <span ref={headingLine1Ref} style={styles.headingLine}>FREQUENTLY ASKED</span>
                    <br />
                    <span ref={headingLine2Ref} style={styles.headingLine}>QUESTIONS</span>
                </h1>

                <div style={styles.faqList}>
                    {faqData.map((item, index) => (
                        <div 
                            key={item.id}
                            className="faq-item"
                            style={{
                                ...styles.faqItem,
                                ...(openItems[item.id] && styles.faqItemOpen)
                            }}
                            onClick={() => toggleItem(item.id)}
                        >
                            <div style={styles.questionWrapper}>
                                <div style={styles.questionNumber}>
                                    {String(index + 1).padStart(2, '0')}
                                </div>
                                <h3 style={styles.question}>
                                    {item.question}
                                </h3>
                                <div style={styles.iconWrapper}>
                                    <FontAwesomeIcon 
                                        icon={openItems[item.id] ? faMinus : faPlus}
                                        style={{
                                            ...styles.icon,
                                            transform: openItems[item.id] ? 'rotate(0deg)' : 'rotate(0deg)'
                                        }}
                                    />
                                </div>
                            </div>

                            <div 
                                style={{
                                    ...styles.answerWrapper,
                                    maxHeight: openItems[item.id] ? '200px' : '0px',
                                    opacity: openItems[item.id] ? 1 : 0,
                                    paddingTop: openItems[item.id] ? '20px' : '0px'
                                }}
                            >
                                <p style={styles.answer}>
                                    {item.answer}
                                </p>
                            </div>

                            <div 
                                style={{
                                    ...styles.decorativeLine,
                                    width: openItems[item.id] ? '100%' : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

               
               
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        minHeight: '100vh',
        backgroundColor: 'rgb(31, 22, 35)',
        padding: '100px 0',
        position: 'relative',
        overflow: 'hidden'
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
    faqWrapper: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 40px',
        position: 'relative',
        zIndex: 2
    },
    mainHeading: {
        fontSize: 'clamp(3rem, 6vw, 5rem)',
        fontWeight: '900',
        textAlign: 'left',
        marginBottom: '80px',
        fontFamily: "'Orbitron', sans-serif",
        color: 'inherit',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        position: 'relative',
    },
    headingLine: {
        display: 'inline-block',
        whiteSpace: 'nowrap',
        lineHeight: 1.05,
        background: "linear-gradient(135deg, rgb(223, 30, 114) 0%, rgb(230, 110, 41) 50%, rgb(255, 191, 0) 100%)",
        color: 'transparent',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text'
    },
    faqList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    faqItem: {
        backgroundColor: 'rgba(15, 15, 15, 0.6)',
        border: '1px solid rgba(223, 30, 114, 0.2)',
        borderRadius: '15px',
        padding: '30px',
        cursor: 'pointer',
        transition: 'all 0.4s ease',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        '&:hover': {
            borderColor: 'rgba(223, 30, 114, 0.5)',
            transform: 'translateY(-5px)',
            boxShadow: '0 15px 40px rgba(223, 30, 114, 0.1)'
        }
    },
    faqItemOpen: {
        borderColor: 'rgba(223, 30, 114, 0.6)',
        backgroundColor: 'rgba(15, 15, 15, 0.8)',
        boxShadow: '0 20px 50px rgba(223, 30, 114, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    },
    questionWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        width: '100%'
    },
    questionNumber: {
        fontSize: '1.2rem',
        fontWeight: '700',
        color: 'rgba(223, 30, 114, 0.8)',
        fontFamily: "'JetBrains Mono', monospace",
        minWidth: '40px',
        textAlign: 'center'
    },
    question: {
        fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.95)',
        margin: 0,
        flex: 1,
        fontFamily: "'Inter', sans-serif",
        lineHeight: '1.4',
        textAlign: 'left'
    },
    iconWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'rgba(223, 30, 114, 0.1)',
        border: '1px solid rgba(223, 30, 114, 0.3)',
        transition: 'all 0.3s ease'
    },
    icon: {
        fontSize: '16px',
        color: 'rgba(223, 30, 114, 0.8)',
        transition: 'all 0.3s ease'
    },
    answerWrapper: {
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        marginLeft: '60px'
    },
    answer: {
        fontSize: '1rem',
        lineHeight: '1.7',
        color: 'rgba(248, 245, 220, 0.85)',
        margin: 0,
        fontFamily: "'Inter', sans-serif",
        fontWeight: '400'
    },
    decorativeLine: {
        height: '2px',
        background: 'linear-gradient(90deg, rgba(223, 30, 114, 0.8) 0%, rgba(230, 110, 41, 0.6) 50%, rgba(255, 191, 0, 0.4) 100%)',
        marginTop: '20px',
        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRadius: '1px'
    },
    bottomDecoration: {
        textAlign: 'center',
        marginTop: '100px',
        position: 'relative'
    },
    glowOrb: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(223, 30, 114, 0.3) 0%, rgba(223, 30, 114, 0.1) 50%, transparent 100%)',
        margin: '0 auto 30px',
        filter: 'blur(20px)',
        animation: 'pulse 3s ease-in-out infinite'
    },
    decorativeText: {
        fontSize: '1.1rem',
        color: 'rgba(248, 245, 220, 0.7)',
        fontFamily: "'Inter', sans-serif"
    },
    contactLink: {
        color: 'rgb(223, 30, 114)',
        textDecoration: 'underline',
        cursor: 'pointer',
        transition: 'color 0.3s ease',
        '&:hover': {
            color: 'rgb(255, 191, 0)'
        }
    }
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.1); opacity: 0.6; }
    }
    
    .faq-item:hover {
        border-color: rgba(223, 30, 114, 0.5) !important;
        transform: translateY(-5px) !important;
        box-shadow: 0 15px 40px rgba(223, 30, 114, 0.1) !important;
    }
    
    .faq-item:hover .icon-wrapper {
        background-color: rgba(223, 30, 114, 0.2) !important;
        border-color: rgba(223, 30, 114, 0.5) !important;
    }
    
    .faq-item:hover .contact-link:hover {
        color: rgb(255, 191, 0) !important;
    }
`;

if (typeof document !== 'undefined') {
    document.head.appendChild(styleSheet);
}

export default FAQ;