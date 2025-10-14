import React, { useEffect, useState, useRef } from "react";
import "./PromptPage.css";
import Sam from "../../Picture/sam_2.png";
import Sent from "../../Picture/sent-icon.png";
import Head from "../../Picture/sam's Head.png"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios';
import ReactMarkdown from "react-markdown";
import { faShare } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../Components/LoadingAnimation/Simple";
import Appsss from "../../Components/LoadingAnimation/LoadingAnimation2";
import aicomicx2 from "../../Picture/aicomic2.jpg";
import { API_ENDPOINTS } from "../../config/api";
import { useUser } from "@clerk/clerk-react";
import LoadingAnimation from "../../Components/LoadingAnimation/LoadingAnimation2"

function PromptPage() {
    const [showLogo, setShowLogo] = useState(true);
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [color, setcolor] = useState('grey');
    const [text, setresponse] = useState("");
    const [LoadingIdx, SetLoadingIdx] = useState(false);
    const [loading, setloading] = useState(false);
    const navigate = useNavigate();
    const [latestResponse, setLatestResponse] = useState("");
    const [displayedChunks, setDisplayedChunks] = useState("");
    const [isScrolling, setIsScrolling] = useState(false);
    const bottomRef = useRef(null);
    const { isSignedIn, user, isLoaded } = useUser();


    const handleSend = async () => {
        if (message.trim() !== "") {
            if (showLogo) setShowLogo(false);
            setChatHistory([...chatHistory, { text: message, sender: "user" }]);
            setMessage("");
            SetLoadingIdx(chatHistory.length);
            try {
                const res = await axios.post(API_ENDPOINTS.transferSam, { message })
                setresponse(res.data.data);
                setLatestResponse(res.data.data);
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
            SetLoadingIdx(null);
        }
    };

    const sendtoNar2Nar = async () => {
        if (color === 'green') {
            setloading(true);
            try {
                const res = await axios.post(API_ENDPOINTS.ayush, { text })
                console.log(res.data.sucess)
                if (res.data.sucess === true) {
                    navigate('/Generate_Story');
                }
            } catch (error) {
                console.log(error);
            }
            setloading(false);
        }
    }


    useEffect(() => {
        if (latestResponse.length > 0) {
            const chunks = latestResponse.split(" ");
            var i = 0;
            const interval = setInterval(() => {
                setDisplayedChunks(prev => prev + " " + chunks[i]);
                i++;
                if (i >= chunks.length) {
                    clearInterval(interval);
                }
            }, 30);

        }

        setDisplayedChunks("");

    }, [latestResponse]);

    useEffect(() => {
        if (!isScrolling && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [displayedChunks, chatHistory]);

    const handleScroll = () => {
        setIsScrolling(true);
    }

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate("/");
        }
    }, [isLoaded, isSignedIn, navigate]);

    if (!isLoaded) return <LoadingAnimation />;
    if (!isSignedIn) return null;

    return (
        <div className="container">

            <div className='logocomic-promptPage'>
                <img src={aicomicx2} className='Logo-promptPage' alt="Logo" />
            </div>

            {showLogo && (
                <div className="mascot">
                    <img src={Sam} className="mascot-logo" alt="Sam Mascot" />
                </div>
            )}

            {loading && <Appsss />}

            {<div className="chat-container" onScroll={handleScroll}>

                {chatHistory.map((msg, index) => (

                    <div key={index} style={{ width: "100%" }}>

                        <div className={`chat-bubble ${msg.sender === "user" ? "user" : "bot"}`}>
                            {msg.sender === "bot" ? (
                                <div className="displayname">
                                    <div className="textmsg">
                                        <ReactMarkdown>{index === chatHistory.length - 1 ? displayedChunks : msg.text}</ReactMarkdown>
                                        <div ref={bottomRef} ></div>

                                    </div>
                                    <div className="share-btn-container">
                                        <FontAwesomeIcon color={color} onClick={sendtoNar2Nar} className="share" icon={faShare} />
                                    </div>

                                </div>

                            ) : (
                                <>

                                    {msg.text}




                                </>


                            )
                            }



                        </div>
                        {msg.sender === "user" && (
                            <>
                                <div className="bot-logo-container">
                                    <img src={Head} alt="Sam Logo" className="bot-logo" />
                                    <p>SAM</p>

                                </div>
                                {index === LoadingIdx && (
                                    <LoadingSpinner />
                                )}

                            </>
                        )}


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