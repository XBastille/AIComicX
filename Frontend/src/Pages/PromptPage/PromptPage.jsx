import React, { useState } from "react";
import "./PromptPage.css";
import Sam from "../../Picture/sam_2.png";
import Sent from "../../Picture/sent-icon.png";
import Head from "../../Picture/sam's Head.png"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios';
import ReactMarkdown from "react-markdown";
import { faShare } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";

function PromptPage() {
    const [showLogo, setShowLogo] = useState(true);
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [color, setcolor] = useState('grey');
    const [text, setresponse] = useState("");
    const navigate = useNavigate();

    const handleSend = async () => {
        if (message.trim() !== "") {
            if (showLogo) setShowLogo(false);
            setChatHistory([...chatHistory, { text: message, sender: "user" }]);
            setMessage("");
            console.log(message)
            try {
                const res = await axios.post("http://localhost:3000/chat/transferSam", { message })
                console.log(res.data.data);
                setresponse(res.data.data);
                if (res.data.data.length > 1000) {
                    setcolor('green')
                }
                else {
                    setcolor('grey')
                }
                setChatHistory([...chatHistory, { text: message, sender: "user" }, { text: `${res.data.data}` || "Sorry ,error has been occured", sender: "bot" }]);

            } catch (error) {
                console.log(error)
                if (message.length < 1000) {
                    setcolor('grey')
                }
                setChatHistory([...chatHistory, { text: message, sender: "user" }, { text: "Sorry ,error has been occured.Please try again later", sender: "bot" }]);
            }

        }
    };

    const sendtoNar2Nar = async () => {
        if (color === 'green') {
            console.log(text)
            try {
                const res = await axios.post("http://localhost:3000/chat/ayush", { text })
                console.log(res.data.sucess)
                if (res.data.sucess === true) {
                    console.log("hello")
                    navigate('/Generate_Story');
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    return (
        <div className="container">


            {showLogo && (
                <div className="mascot">
                    <img src={Sam} className="mascot-logo" alt="Sam Mascot" />
                </div>
            )}


            {/* <div className="chat-container">
            {chatHistory.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.sender}`}>
            {msg.text}
          </div>
           ))}
           </div> */}

            {/*yaha dimaag kharab ho gya bc */}

            {<div className="chat-container">
                {chatHistory.map((msg, index) => (
                    <div key={index}>
                        {msg.sender === "bot" && (
                            <div className="bot-logo-container">
                                <img src={Head} alt="Sam Logo" className="bot-logo" />
                                <p>SAM</p>
                            </div>
                        )}
                        <div className={`chat-bubble ${msg.sender === "user" ? "user" : "bot"}`}>
                            {msg.sender === "bot" ? (
                                <div className="displayname">
                                    <div className="textmsg">
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    </div>
                                    <div >
                                        <FontAwesomeIcon color={color} onClick={sendtoNar2Nar} className="share" icon={faShare} />
                                    </div>
                                </div>

                            ) : (
                                msg.text
                            )

                            }
                        </div>
                    </div>
                ))}
            </div>}


            <div className="search-bar">
                <textarea
                    type="text"
                    placeholder="Ask Sam..."
                    className="input"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <button className="send-button" onClick={handleSend}>
                    <img src={Sent} className="send-logo" alt="Send Icon" />
                </button>
            </div>
        </div>
    );
}

export default PromptPage;