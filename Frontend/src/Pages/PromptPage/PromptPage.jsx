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


    const handleSend = async () => {
        if (message.trim() !== "") {
            if (showLogo) setShowLogo(false);
            setChatHistory([...chatHistory, { text: message, sender: "user" }]);
            setMessage("");
            SetLoadingIdx(chatHistory.length);
            console.log(message);
            try {
                const res = await axios.post("http://localhost:3000/chat/transferSam", { message })
                console.log(res.data.data);
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
            console.log(text)
            setloading(true);
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
            setloading(false);
        }
    }

    const response = "Hello there i am a boy my name is arpit mishra what yours In todays rapidly evolving digital landscape, technology plays a pivotal role in shaping how we live, work, and interact with the world. From artificial intelligence and machine learning to blockchain and quantum computing, the pace of innovation is both exciting and overwhelming. These advancements are not only transforming industries but also redefining everyday human experiences. For instance, AI-driven virtual assistants are now capable of handling complex tasks, while autonomous vehicles are being tested to reduce traffic accidents and increase transportation efficiency. Meanwhile, the growing adoption of renewable energy solutions is reshaping our global energy strategy to combat climate change. Despite the benefits, these technologies raise important ethical questions regarding privacy, employment, and equity, which society must address to ensure inclusive progress. Education systems are also adapting, with online learning platforms and virtual classrooms making knowledge more accessible than ever before. As we move further into the 21st century, the challenge lies not only in harnessing the power of these technologies but in doing so responsibly, sustainably, and with a deep understanding of their social implications."

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
            }, 50);

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