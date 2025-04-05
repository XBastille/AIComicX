import React from "react";
import { color, motion } from "framer-motion";
import { useState } from "react";
import { windowlistner } from "../WindowListener/WindowListener"
import "./Register.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNavigate } from "react-router-dom";

import axios from 'axios'

function Register() {

    const [position, setposition] = useState({ x: 0, y: 0 });
    const navigate = useNavigate();

    const [name, setname] = useState('')
    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    const [confirm, setconfirm] = useState('')
    const [role, setrole] = useState('')

    const [errors, setErrors] = useState('');

    const submits = async (event) => {
        event.preventDefault();
        setname('')
        setemail('')
        setpassword('')
        setconfirm('')
        setrole('')

        try {
            const response = await axios.post('http://localhost:3000/user/signup', { name, email, password, confirm, role })
            console.log(response.data)
            if (response.data.sucess === true) {
                navigate('/user/login')
                console.log("navigate karna h")
            }
            if (response.data.sucess === false) {
                navigate('/user/signup')
                console.log("navigate to signup")
                console.log(response.data.error[0].msg)
                setErrors(response.data.error[0].msg)
            }
            console.log(name, email, password, confirm, role)
        } catch (error) {
            console.log(error)
        }
        console.log("hwllo world")
    }

    windowlistner('pointermove', (e) => {
        setposition({ x: e.clientX, y: e.clientY })
    })

    const login = () => {
        navigate('/user/login')
    }

    function timingout() {
        setTimeout(() => {
            setErrors('')
        }, 5000);
    }
    return (
        <motion.div style={styles.login}>
            <div className="cursor" style={{
                ...styles.cursor,
                transform: `translate(${position.x}px, ${position.y}px)`
            }}></div>

            <motion.div style={styles.innerLogin}>
                <motion.div>

                    <h1 style={styles.artist}>LEARN ANYTIME, ANYWHERE</h1>
                    <p style={styles.stories}><span style={{ fontWeight: 'bold', color: 'rgb(222, 218, 219)', fontFamily: "sans-serif" }}>TRANSFORM THE WAY YOU LEARN.</span>™ New here? Sign up today and get a free learning guide and your first interactive lesson on us. Discover, grow, and make learning an exciting journey with our cutting-edge platform!</p>
                </motion.div>
                <motion.div style={styles.centerss}>
                    <motion.div >
                        <p style={styles.heading}>SIGN UP</p>
                        <p style={{
                            ...styles.subheading,
                            marginBottom: errors ? "70px" : "30px",
                        }}>Join us today and unlock endless possibilities!</p>
                        <motion.div>
                            {errors && (
                                <p className="error" style={{
                                    ...styles.error,
                                    marginTop: errors ? "40px" : "20px",

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
                        <motion.div style={styles.emailContainer}>
                            <label htmlFor="confirm_password" style={styles.label}>Role :</label>
                            <input style={styles.input} type="name" id="role" name="role" value={role} onChange={(event) => setrole(event.target.value)}></input>
                        </motion.div>
                        <motion.button style={styles.button}
                            whileHover={{
                                scale: 1.04,
                                color: 'rgb(196, 195, 195)',
                                background: "linear-gradient(to right, rgba(255, 235, 59, 0.85), rgba(255, 204, 204, 0.85))",
                            }}
                            whileTap={{
                                scale: 1.01,
                            }}
                            type="submit" onClick={submits}>SIGN UP</motion.button>
                        <motion.div className="Account" style={styles.accountText} >
                            Already have account?{" "}
                            <motion.a title="No account" style={styles.links} onClick={login}>
                                Login!
                            </motion.a>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}

const styles = {
    login: {
        backgroundColor: 'rgb(31, 22, 35)',
        color: '#e0dfdd',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

    },
    innerLogin: {
        height: '100%',
        width: '70%',
        padding: '30px',
    },
    heading: {
        color: 'white',
        fontSize: '38px',
        fontWeight: '900',
        marginBottom: '5px',
        marginTop: "10%",

    },
    subheading: {
        fontSize: '18px',
        marginBottom: '5%',

    },
    inputGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginRight: '520px',
        fontSize: '20px',
        marginBottom: "10px",

    },
    labelss: {
        display: 'block',
        marginRight: '480px',
        fontSize: '20px',
        marginBottom: "10px"
    },
    labels: {
        display: 'block',
        marginRight: '400px',
        fontSize: '20px',
        marginBottom: "10px"
    },
    input: {
        border: 'none',
        width: '50%',
        padding: '15px',
        backgroundColor: 'rgb(31, 22, 35)',
        color: 'white',
        marginBottom: '30px',
        borderBottom: "2px solid rgb(173, 167, 167)",
    },
    inputss: {
        border: 'none',
        width: '50%',
        padding: '15px',
        backgroundColor: 'rgb(31, 22, 35)',
        color: 'white',
        marginBottom: '30px',
        borderBottom: "2px solid rgb(173, 167, 167)",
    },
    link: {
        color: 'rgb(173, 167, 167)',
        textDecoration: 'none',
        marginLeft: '270px',
    },
    accountText: {
        marginTop: '20px',
        fontSize: '16px',
    },
    button: {
        border: '2px solid rgb(173, 167, 167)',
        borderRadius: '30px',
        padding: '15px',
        width: '60%',
        marginTop: '20px',
        backgroundColor: 'rgb(24, 18, 28)',
        fontSize: "18px",
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
        opacity: '0.9',
    },
    error: {
        position: 'absolute',
        top: '350px',
        left: '43%',
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        color: 'white',
        padding: '13px 35px',
        borderRadius: '7px',
        fontSize: '16px',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    artist: {
        fontSize: '45px',
        fontWeight: "900",
        fontFamily: "'Michroma', sans-serif",
        background: "linear-gradient(to right, rgba(255, 235, 59, 0.85), rgba(255, 204, 204, 0.85))",
        color: "transparent",
        backgroundClip: "text",
        display: "inline-block",
        fontStyle: "normal",
        fontDisplay: "swap"
    },
    stories: {
        fontSize: "18px",
        fontFamily: "Verdana, Geneva, Tahoma, sans-serif",
        color: "#e0dfdd"
    },
    centerss: {
        // display:'flex',
        textAlign: 'center'
    },
}
export default Register