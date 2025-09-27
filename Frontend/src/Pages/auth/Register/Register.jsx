import React from "react";
import { color, motion } from "framer-motion";
import { useState } from "react";
import { windowlistner } from "../../../Components/common/WindowListener/WindowListener"
import "./Register.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { useNavigate } from "react-router";
import axios from 'axios'
import Carousel from '../../../Components/ui/Carousel/Carousel';

function Register() {

    const [position, setposition] = useState({ x: 0, y: 0 });
    const navigate = useNavigate();

    const [name, setname] = useState('')
    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    const [confirm, setconfirm] = useState('')

    const [errors, setErrors] = useState('');

    const submits = async (event) => {
        event.preventDefault();
        setname('')
        setemail('')
        setpassword('')
        setconfirm('')

        try {
            const response = await axios.post('http://localhost:3000/user/signup', { name, email, password, confirm })
            console.log(response.data)
            if (response.data.sucess === true) {
                navigate('/user/Login')
                console.log("navigate karna h")
            }
            if (response.data.sucess === false) {
                navigate('/user/Register')
                console.log("navigate to signup")
                console.log(response.data.error[0].msg)
                setErrors(response.data.error[0].msg)
            }
            //   console.log(name, email, password, confirm)
        } catch (error) {
            console.log(error)
        }
    }

    const google = () => {
        try {
            window.location.href = "http://localhost:3000/user/auth/google";
            //const res=await axios.get('http://localhost:3000/user/auth/google')
            console.log(res)
        } catch (error) {
            console.log(error);
        }
    }

    windowlistner('pointermove', (e) => {
        setposition({ x: e.clientX, y: e.clientY })
    })

    const changeLogin = () => {
        navigate('/user/Login')
    }

    function timingout() {
        setTimeout(() => {
            setErrors('')
        }, 4000);
    }

    return (
        <motion.div style={styles.login}>
            <div className="cursor" style={{
                ...styles.cursor,
                transform: `translate(${position.x}px, ${position.y}px)`
            }}></div>

            <motion.div style={styles.container}>
                <motion.div style={styles.innerLogin}>
                    <motion.div>
                        <h1 style={styles.artist}>ARTISTS & STORYTELLERS, ASSEMBLE!</h1>
                        <p style={styles.stories}><span style={{ fontWeight: 'bold', color: 'rgb(222, 218, 219)', fontFamily: "sans-serif" }}>BRING YOUR STORIES TO LIFE.</span>™ New here? Sign up today and get a free character template and your first comic panel on us. Create, share, and experience storytelling like never before on our cutting-edge platform!"?</p>
                    </motion.div>
                    <motion.div style={styles.centerss}>
                        <motion.div >
                            <p style={styles.heading}>SIGN UP</p>
                            <p style={{
                                ...styles.subheading,
                                marginBottom: errors ? "30px" : "15px",
                            }}>Join us today and unlock endless possibilities!</p>
                            <motion.div>
                                {errors && (
                                    <p className="error" style={{
                                        ...styles.error,
                                        marginTop: errors ? "5px" : "10px",

                                    }} {...timingout()} > {errors} </p>
                                )}
                            </motion.div>
                        </motion.div>
                        <motion.div>
                            <motion.div style={styles.emailContainer}>
                                <label htmlFor="name" style={styles.label}>Name :</label>
                                <input style={styles.input} type="name" id="name" name="name" value={name} onChange={(event) => { setname(event.target.value) }} required></input>
                            </motion.div>
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
                                    color: 'rgb(255, 255, 255)',
                                    background: "linear-gradient(to right,rgba(233, 29, 83, 0.67), rgba(251, 231, 81, 0.69))",
                                }}
                                whileTap={{
                                    scale: 1.01,
                                }}
                                type="submit" onClick={submits}>SIGN UP</motion.button>
                            <motion.div className="Account" style={styles.accountText} >
                                Already have account?{" "}
                                <motion.button title="No account" style={styles.links_button} onClick={changeLogin}>
                                    Login!
                                </motion.button>
                            </motion.div>
                            <motion.div className="iconss">
                                <motion.button className="btn" onClick={google}><FontAwesomeIcon icon={faGoogle} className="icons" /><span>Google</span></motion.button>
                                <motion.button className="btn"><FontAwesomeIcon icon={faGithub} className="icons"
                                /><span>Github</span></motion.button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>
                
                <motion.div style={styles.carouselSection}>
                    <Carousel />
                </motion.div>
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
        padding: '15px',
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
        fontSize: '28px',
        fontWeight: '900',
        marginBottom: '3px',
        marginTop: "1%",
    },
    subheading: {
        fontSize: '14px',
        marginBottom: '2%',
    },
    inputGroup: {
        marginBottom: '10px',
    },
    label: {
        display: 'block',
        marginRight: '460px',
        fontSize: '16px',
        marginBottom: "5px",
    },
    labelss: {
        display: 'block',
        marginRight: '420px',
        fontSize: '16px',
        marginBottom: "5px"
    },
    labels: {
        display: 'block',
        marginRight: '340px',
        fontSize: '16px',
        marginBottom: "5px"
    },
    input: {
        border: 'none',
        width: '50%',
        padding: '10px',
        backgroundColor: 'rgb(31, 22, 35)',
        color: 'white',
        marginBottom: '15px',
        borderBottom: "2px solid rgb(173, 167, 167)",
    },
    link: {
        color: 'rgb(173, 167, 167)',
        textDecoration: 'none',
        marginLeft: '270px',
    },
    accountText: {
        marginTop: '10px',
        fontSize: '13px',
    },
    button: {
        border: '2px solid rgb(173, 167, 167)',
        borderRadius: '30px',
        padding: '10px',
        width: '60%',
        marginTop: '10px',
        backgroundColor: 'rgb(24, 18, 28)',
        fontSize: "15px",
        color: 'white',
        fontWeight: "900",
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
    },
    error: {
        position: 'absolute',
        top: '320px',
        left: '280px',
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 25px',
        borderRadius: '7px',
        fontSize: '13px',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    artist: {
        fontSize: '26px',
        fontWeight: "900",
        fontFamily: "'Michroma', sans-serif",
        background: "linear-gradient(to right,rgb(223, 30, 114),rgb(230, 110, 41),rgb(255, 191, 0))",
        color: "transparent",
        backgroundClip: "text",
        display: "inline-block",
        fontStyle: "normal",
        fontDisplay: "swap",
        marginBottom: '8px'
    },
    stories: {
        fontSize: "12px",
        fontFamily: "Verdana, Geneva, Tahoma, sans-serif",
        color: "#e0dfdd",
        marginBottom: '10px'
    },
    centerss: {
        textAlign: 'center'
    },
    links_button: {
        background: "transparent",
        color: "white",
        border: "none",
        fontSize: "13px",
        borderBottom: "1px solid white"
    }
}
export default Register