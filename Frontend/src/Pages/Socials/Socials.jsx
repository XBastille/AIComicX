import React from "react";
import './Socials.css';
import Linkedin from "../../../Picture/linkedin.png"
import github from "../../../Picture/github.png"
import instagram from "../../../Picture/instagram-new.png"
import X from "../../../Picture/X_logo_2023_white.png"

function Socials(){
    return(
        <div className="container">
           <h1 className="tag">SOCIALS</h1>
           <br></br>
           <br></br>
           <div className="underline"></div>
           <div className="links">
            <div className="items1">
                <h2>Bibhor Puhan</h2>
                <div className="underline2"></div>
                <div className="accounts">
                    <div className="linkedin">
                        <img className="placeimage" src={Linkedin} ></img>
                      <p className="account-name">Linkedin</p>
                    </div>
                    <div className="github">
                        <img src={github} className="placeimage"></img>
                     <p className="account-name">Github</p>
                    </div>
                </div>
            </div>

            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
           
            <div className="items1">
                <h2>Ayush Jha</h2>
                <div className="underline2"></div>
                <div className="accounts">
                    <div className="linkedin">
                        <img className="placeimage" src={Linkedin} ></img>
                        <a href="https://www.linkedin.com" target="_blank" ><p className="account-name">Linkedin</p></a> 
                    </div>
                    <div className="github">
                        <img src={github} className="placeimage"></img>
                     <p className="account-name">Github</p>
                    </div>
                    <div className="instagram">
                        <img src={instagram} className="placeimage"></img>
                        <p className="account-name">Instagram</p>
                    </div>
                </div>
            </div>

            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>

            <div className="items1">
                <h2>Abhinab Sharma</h2>
                <div className="underline2"></div>
                <div className="accounts">
                    <div className="linkedin">
                    <img className="placeimage" src={Linkedin} ></img>
                      <p className="account-name">Linkedin</p>
                    </div>
                    <div className="github">
                        <img src={github} className="placeimage"></img>
                     <p className="account-name">Github</p>
                    </div>
                    <div className="instagram">
                        <img src={instagram} className="placeimage"></img>
                        <p className="account-name">Instagram</p>
                    </div>
                    <div className="twitter">
                        <img src={X} className="placeimage"></img>
                        <p className="account-name">Twitter</p>
                    </div>
                </div>
            </div>

            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>


            <div className="items1">
                <h2>Arpit Mishra</h2>
                <div className="underline2"></div>
                <div className="accounts">
                    <div className="linkedin">
                        <img className="placeimage" src={Linkedin} ></img>
                      <p className="account-name">Linkedin</p>
                    </div>
                    <div className="github">
                        <img src={github} className="placeimage"></img>
                     <p className="account-name">Github</p>
                    </div>
                    <div className="instagram">
                        <img src={instagram} className="placeimage"></img>
                        <p className="account-name">Instagram</p>
                    </div>
                    <div className="twitter">
                        <img src={X} className="placeimage"></img>
                        <p className="account-name">Twitter</p>
                    </div>
                </div>
            </div>

           </div>
        </div>
    )
}

export default Socials;