import React from "react";
import { color, motion } from "framer-motion";
import { useState } from "react";
import { windowlistner } from "../WindowListener/WindowListener"
import "../Register/Register.css"
import axios from 'axios'
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [position, setposition] = useState({ x: 0, y: 0 });

    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    const [confirm, setconfirm] = useState('')

    const [errors, seterror] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        console.log(email, password);

        setemail('');
        setpassword('');
        setconfirm('');

        try {
            const res = await axios.post('http://localhost:3000/user/login', { email, password });
            console.log("Data transfer successful: ", res.data.sucess, res.data.message);

            if (res.data.sucess === true && res.data.message === 'new Admin Created') {
                console.log("Navigate to Dashboard");
                navigate('/admin');
            }
            else if (res.data.sucess === true && res.data.message === 'new student Created') {
                console.log("Navigate to Dashboard");
                navigate('/student');
            }
            else if (res.data.sucess === false) {
                console.log(res.data.error?.[0]?.msg || "Unknown error");
                seterror(res.data.error?.[0]?.msg || "Something went wrong");
                navigate('/user/login')
            }
        } catch (error) {
            console.log("Request failed:", error);
            seterror("Server error, please try again later.");
        }
    };


    windowlistner('pointermove', (e) => {
        setposition({ x: e.clientX, y: e.clientY })
    })

    const account = () => {
        navigate('/user/signup')
    }


    function timingout() {
        setTimeout(() => {
            seterror('')
        }, 4000);
    }
    return (
        <motion.div style={styles.login}>
            <div className="cursor" style={{
                ...styles.cursor,
                transform: `translate(${position.x}px, ${position.y}px)`
            }}></div>

            <motion.div style={styles.innerLogin}>
                <motion.div>

                    <h1 style={styles.artist}>WELCOME BACK, KNOWLEDGE SEEKER!</h1>
                    <p style={styles.stories}>YOUR JOURNEY AWAITS — STEP BACK INTO A WORLD BUILT FOR GROWTH, CURIOSITY, AND POSSIBILITY. HERE, EVERY CLICK IS A STEP FORWARD, EVERY LESSON UNLOCKS NEW POTENTIAL, AND EVERY MOMENT SPENT LEARNING BRINGS YOU CLOSER TO THE FUTURE YOU IMAGINE. THIS IS MORE THAN EDUCATION — IT’S YOUR PATH, YOUR PASSION, AND YOUR POWER.</p>
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
                                color: 'rgb(255, 255, 255)',
                                background: "linear-gradient(to right, rgba(255, 235, 59, 0.85), rgba(255, 204, 204, 0.85))",
                            }}
                            whileTap={{
                                scale: 1.01,
                            }}
                            type="submit" onClick={submit}>LOGIN</motion.button>
                        <motion.div className="Account" style={styles.accountText} >
                            No account yet?{" "}
                            <motion.a title="No account" style={styles.links} onClick={account}>
                                Create your account now
                            </motion.a>
                        </motion.div>
                    </motion.div>
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
        marginRight: '530px',
        fontSize: '20px',
        marginBottom: "10px",

    },
    labelss: {
        display: 'block',
        marginRight: '490px',
        fontSize: '20px',
        marginBottom: "10px"
    },
    labels: {
        display: 'block',
        marginRight: '410px',
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
        top: '410px',
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
        fontSize: '38px',
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
        fontSize: "16px",
        fontFamily: "Verdana, Geneva, Tahoma, sans-serif",
        color: "#e0dfdd"
    },
    centerss: {
        // display:'flex',
        textAlign: 'center'
    },
}
export default Login