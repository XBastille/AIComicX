import React from "react";
import { color, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { windowlistner } from "../WindowListener/WindowListener"
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import "../Register/Register.css"
import Carousel from '../Carousel/Carousel';
import { useSignIn } from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";
import LoadingAnimation from "../LoadingAnimation/LoadingAnimation2";
import { useClerk, useAuth } from "@clerk/clerk-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';

function Login() {
    const { openSignIn } = useClerk();
    const { authenticateWithRedirect } = useClerk();
    const { signIn, setActive } = useSignIn();

    const handleGoogleLogin = () => {
        signIn.authenticateWithRedirect({
            strategy: "oauth_google",
            redirectUrl: "/SelectPage",
        });
    };

    const handleGitHubLogin = () => {
        signIn.authenticateWithRedirect({
            strategy: "oauth_github",
            redirectUrl: "/SelectPage",
        });
    };

    const [position, setposition] = useState({ x: 0, y: 0 });

    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    const [confirm, setconfirm] = useState('')

    const [errors, setErrors] = useState('');
    const navigate = useNavigate();


    const { isSignedIn, user, isLoaded } = useUser();


    windowlistner('pointermove', (e) => {
        setposition({ x: e.clientX, y: e.clientY })
    })

    // const submitss = async (event) => {
    //     event.preventDefault();
    //     setemail('')
    //     setpassword('')
    //     setconfirm('')


    //     try {
    //         const response = await axios.post('http://localhost:3000/user/login', { email, password })
    //         console.log(response.data)
    //         if (response.data.sucess === true) {
    //             navigate('/SelectPage')
    //             console.log("navigate karna h")
    //         }
    //         if (response.data.sucess === false) {
    //             setErrors(response.data.error[0].msg)
    //         }
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }


    const submitss = async (event) => {
        event.preventDefault();
        setemail('');
        setpassword('');
        setconfirm('');
        try {
            const response = await signIn.create({
                identifier: email,
                password: password,
            });
            if (response.status === "complete") {
                await setActive({ session: response.createdSessionId });
                navigate('/SelectPage');
            } else {
                setErrors('Login failed, please check your credentials.');
            }
        } catch (error) {
            console.error(error);
            setErrors('An error occurred during login. Please try again.');
        }
    }

    const no_account = () => {
        console.log("click ho rha h")
        navigate("/user/Register")
    }


    function timingout() {
        setTimeout(() => {
            setErrors('')
        }, 4000);
    }

    // useEffect(() => {
    //     if (isLoaded && isSignedIn) {
    //         navigate("/");
    //     }
    // }, [isLoaded, isSignedIn, navigate]);

    // if (!isLoaded) return <LoadingAnimation />;
    // if (isSignedIn) return null;
    return (
        <motion.div style={styles.login}>
            <div className="cursor" style={{
                ...styles.cursor,
                transform: `translate(${position.x}px, ${position.y}px)`
            }}></div>

            <motion.div style={styles.container}>
                <motion.div style={styles.innerLogin}>
                    <motion.div>
                        <h1 style={styles.artist}>WELCOME BACK, STORYTELLER!</h1>
                        <p style={styles.stories}>YOUR STORIES AWAIT—STEP BACK INTO YOUR WORLD OF CREATIVITY AND IMAGINATION, WHERE EVERY IDEA TAKES SHAPE AND EVERY CHARACTER COMES TO LIFE.</p>
                    </motion.div>
                    <motion.div style={styles.centerss}>
                        <motion.div >
                            <p style={styles.heading}>LOGIN</p>
                            <p style={styles.subheading}>Continue your journey and pick up right where you left off.</p>
                        </motion.div>
                        <motion.div>
                            <motion.div style={styles.emailContainer}>
                                <label htmlFor="email" style={styles.label}>Email :</label>
                                <input style={styles.input} type="email" id="email" name="email" value={email} placeholder="example@gmail.com" onChange={(event) => { setemail(event.target.value) }} required></input>
                            </motion.div>
                            <motion.div style={styles.emailContainer}>
                                <label htmlFor="password" style={styles.labelss}>Password :</label>
                                <input style={styles.input} type="password" id="password" name="password" value={password} onChange={(event) => { setpassword(event.target.value) }}></input>
                            </motion.div>
                            <motion.div style={styles.emailContainer}>
                                <label htmlFor="confirm_password" style={styles.labels}>Confirm_Password :</label>
                                <input style={styles.input} type="password" id="confirm_password" value={confirm} name="confirm_password" onChange={(event) => setconfirm(event.target.value)}></input>
                            </motion.div>
                            <motion.button style={styles.button}
                                whileHover={{
                                    scale: 1.04,
                                    color: 'rgb(196, 195, 195)',
                                    background: "linear-gradient(to right,rgb(244, 29, 122),rgb(255, 191, 0))",
                                }}
                                whileTap={{
                                    scale: 1.01,
                                }}
                                type="submit" onClick={submitss}>LOGIN</motion.button>
                            <motion.div className="Account" style={styles.accountText} >
                                No account yet?{" "}
                                <motion.button title="No account" style={styles.links_button} onClick={no_account}>
                                    Create your account now
                                </motion.button>
                            </motion.div>
                            <motion.div className="iconss">
                                <motion.button className="btn" onClick={handleGoogleLogin}><FontAwesomeIcon icon={faGoogle} className="icons" /><span>Google</span></motion.button>
                                <motion.button className="btn" onClick={handleGitHubLogin}><FontAwesomeIcon icon={faGithub} className="icons"
                                /><span>Github</span></motion.button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>

                <motion.div style={styles.carouselSection}>
                    <Carousel />
                </motion.div>
            </motion.div>

            <motion.div>
                {errors && (
                    <p className="error" style={{
                        ...styles.error,
                        marginTop: errors ? "40px" : "20px",

                    }} {...timingout()} > {errors} </p>
                )}
            </motion.div>
        </motion.div>
    )
}

const styles = {
    login: {
        backgroundColor: 'rgb(31, 22, 35)',
        color: '#e0dfdd',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        overflow: 'hidden',
    },
    container: {
        height: '100%',
        display: 'flex',
        width: '100%',
    },
    innerLogin: {
        height: '100%',
        width: '50%',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    carouselSection: {
        height: '100%',
        width: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heading: {
        color: 'white',
        fontSize: '32px',
        fontWeight: '900',
        marginBottom: '5px',
        marginTop: "5%",
    },
    subheading: {
        fontSize: '16px',
        marginBottom: '4%',
    },
    inputGroup: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        marginRight: '460px',
        fontSize: '18px',
        marginBottom: "8px",
    },
    labelss: {
        display: 'block',
        marginRight: '420px',
        fontSize: '18px',
        marginBottom: "8px"
    },
    labels: {
        display: 'block',
        marginRight: '340px',
        fontSize: '18px',
        marginBottom: "8px"
    },
    input: {
        border: 'none',
        width: '50%',
        padding: '12px',
        backgroundColor: 'rgb(31, 22, 35)',
        color: 'white',
        marginBottom: '25px',
        borderBottom: "2px solid rgb(173, 167, 167)",
    },
    link: {
        color: 'rgb(173, 167, 167)',
        textDecoration: 'none',
        marginLeft: '270px',
    },
    accountText: {
        marginTop: '15px',
        fontSize: '14px',
    },
    button: {
        border: '2px solid rgb(173, 167, 167)',
        borderRadius: '30px',
        padding: '12px',
        width: '60%',
        marginTop: '15px',
        backgroundColor: 'rgb(24, 18, 28)',
        fontSize: "16px",
        color: 'white',
        fontWeight: "900"
    },
    links: {
        borderBottom: '2px solid rgb(173, 167, 167)',
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
    error: {
        position: 'absolute',
        top: '300px',
        left: '260px',
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        color: 'white',
        padding: '10px 30px',
        borderRadius: '7px',
        fontSize: '14px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: "30px",
        marginBottom: "15px"
    },
    artist: {
        fontSize: '30px',
        fontWeight: "900",
        fontFamily: "'Michroma', sans-serif",
        background: "linear-gradient(to right,rgb(223, 30, 114),rgb(230, 110, 41),rgb(255, 191, 0))",
        color: "transparent",
        backgroundClip: "text",
        display: "inline-block",
        fontStyle: "normal",
        fontDisplay: "swap",
        marginBottom: '10px'
    },
    stories: {
        fontSize: "14px",
        fontFamily: "Verdana, Geneva, Tahoma, sans-serif",
        color: "#e0dfdd",
        marginBottom: '15px'
    },
    centerss: {
        textAlign: 'center'
    },
    links_button: {
        background: "transparent",
        color: "white",
        border: "none",
        fontSize: "14px",
        borderBottom: "1px solid white"
    }
}
export default Login