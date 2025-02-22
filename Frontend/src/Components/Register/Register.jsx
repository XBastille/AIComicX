import React from "react";
import { color, motion } from "framer-motion";
import { useState } from "react";
import { windowlistner } from "../WindowListener/WindowListener"
import "../Register/Register.css"

function Register() {

    const [position, setposition] = useState({ x: 0, y: 0 });
    // const navigate = useNavigate();

    const [name, setname] = useState('')
    const [username, setusername] = useState('')
    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    const [confirm, setconfirm] = useState('')

    const [errors, setErrors] = useState('');

    // const submits = async (event) => {
    //     event.preventDefault();
    //     setname('')
    //     setusername('')
    //     setemail('')
    //     setpassword('')
    //     setconfirm('')

    //     try {
    //         const response = await axios.post('http://localhost:3001/user/Register', { name, username, email, password, confirm })
    //         console.log(response.data)
    //         if (response.data.success === 'true') {
    //             navigate('/user/Login')
    //         }
    //         if (response.data.success === 'false') {
    //             navigate('/user/Register')
    //             setErrors(response.data.error[0].msg)
    //         }
    //         console.log(name, username, email, password, confirm)
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    windowlistner('pointermove', (e) => {
        setposition({ x: e.clientX, y: e.clientY })
    })

    // const login = () => {
    //     navigate('/user/Login')
    // }

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

            <motion.div style={styles.innerLogin}>
                <motion.div>
                    
                    <h1 style={styles.artist}>ARTISTS & STORYTELLERS, ASSEMBLE!</h1>
                    <p style={styles.stories}><span style={{ fontWeight: 'bold', color: 'rgb(222, 218, 219)', fontFamily: "sans-serif" }}>BRING YOUR STORIES TO LIFE.</span>™ New here? Sign up today and get a free character template and your first comic panel on us. Create, share, and experience storytelling like never before on our cutting-edge platform!"?</p>
                </motion.div>
                <motion.div style={styles.centerss}>
                    <motion.div >
                        <p style={styles.heading}>SIGN UP</p>
                        <p style={styles.subheading}>Join us today and unlock endless possibilities!</p>
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
                                color: 'rgb(196, 195, 195)',
                                background: "linear-gradient(to right,rgb(244, 29, 122),rgb(255, 191, 0))",
                            }}
                            whileTap={{
                                scale: 1.01,
                            }}
                            type="submit">SIGN UP</motion.button>
                        <motion.div className="Account" style={styles.accountText} >
                            Already have account?{" "}
                            <motion.a title="No account" style={styles.links}>
                                Login!
                            </motion.a>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>
            <motion.div>
                {errors && (
                    <p className="error" style={styles.error} {...timingout()} > {errors} </p>
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
        // textAlign: 'center',
        // display: 'flex',
        // alignItems: 'center',
        // justifyContent: 'center',

    },
    innerLogin: {
        height: '100%',
        width: '50%',
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
        marginRight: '460px',
        fontSize: '20px',
        marginBottom: "10px",

    },
    labelss: {
        display: 'block',
        marginRight: '420px',
        fontSize: '20px',
        marginBottom: "10px"
    },
    labels: {
        display: 'block',
        marginRight: '340px',
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
        left: -50,
        top: -50,
        zIndex: 9999,
        opacity: '0.9',
        backdropFilter: "blur(20px)",
    },
    error: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        color: 'white',
        padding: '13px 35px',
        borderRadius: '7px',
        fontSize: '16px',
        fontWeight: 'bold',
        textAlign: 'center',
        boxShadow: '0px 0px 10px rgba(255, 0, 0, 0.5)'
    },
    artist: {
        fontSize: '38px',
        fontWeight: "900",
        fontFamily: "'Michroma', sans-serif",
        background: "linear-gradient(to right,rgb(223, 30, 114),rgb(230, 110, 41),rgb(255, 191, 0))",
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
export default Register