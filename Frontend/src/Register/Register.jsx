import React from "react";
import {useForm} from "react-hook-form"
import { motion } from "framer-motion";
/*import './Register.css'*/

const Register = () =>{
    const {
        register,
        handleSubmit,
        watch,
    } = useForm()

    const onSubmit=(data) =>{
        console.log("Registered Data:", data);
    }

    return(
        <div className="resgister-container">
           <h2>Register</h2>
           <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
               <label>Name</label>
               <input type="text"{...register("name" , {required:"Name is required"})}/>
            </div>

            <div className="form-group">
                <h2>Email</h2>
                <input type="email"{...register("email" , {required:"Email is required"})} />
            </div>

            <div className="form-group">
                <label>Password</label>
                <input 
                type="password"{...register("password" , {required:"Password is required" , minlength:{value:6 , message:"Password must be atleast 6 characters"}})}
                />
            </div>

            <div className="form-group">
                <label>Confirm Password</label>
                <input
                type="password"
                {...register("ConfirmPassword" , {
                    validate : (value) => value === watch("password") || "Passwords do not match",
                })}
                />
                </div>

                <button type="Submit">Register</button>
           </form>
        </div>
    );
};

export default Register;