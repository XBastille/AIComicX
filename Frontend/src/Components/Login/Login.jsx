import React from "react";

function Login() {

    const register = () => {
        console.log('bhak bsdk')
    }
    return (
        <div style={styles.login}>
            <div style={styles.innerLogin}>
                <div >
                    <p style={styles.heading}>Login</p>
                    <p style={styles.subheading}>Hi!! Welcome back</p>
                </div>
                <div style={styles.inputContainer}>
                    <div style={styles.emailContainer}>
                        <label htmlFor="email" style={styles.label}>Email</label>
                        <input style={styles.input} type="email" id="email" name="email" placeholder="Enter your Email"></input>
                    </div>
                    <br></br>
                    <div style={styles.emailContainer}>
                        <label htmlFor="password" style={styles.label}>Password</label>
                        <input style={styles.input} type="password" id="password" name="password" placeholder="Enter your Password"></input>
                    </div>
                    <br></br>
                    <a href='#forget-password' style={styles.link}>Forgot Password</a>
                    <button style={styles.button}
                        whileHover={{
                            scale: 1.04,
                            color: 'black',
                            backgroundColor: 'rgb(173, 167, 167)'
                        }}
                        whileTap={{
                            scale: 1.01,
                        }}
                    >Login</button>
                    <div className="Account" style={styles.accountText} >
                        No account yet?{" "}
                        <a title="No account" style={styles.links} onClick={register} >
                            Create your account now
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

const styles = [{
    login: {
        color: 'black'
    }
}]

export default Login;