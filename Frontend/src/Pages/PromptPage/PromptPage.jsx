import React, { useState } from "react";
import "./PromptPage.css";
import Sam from "../../Picture/sam_2.png";
import Sent from "../../Picture/sent-icon.png";
import Head from "../../Picture/sam's Head.png"


function PromptPage() {
  const [showLogo, setShowLogo] = useState(true);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const handleSend = () => {
    if (message.trim() !== "") {
      if (showLogo) setShowLogo(false); 
      setChatHistory([...chatHistory, { text: message, sender: "user" } , {text:"Once upon a time, in a small village nestled between rolling hills and dense forests, there lived a young girl named Elara. Elara was known throughout the village for her curiosity and adventurous spirit. Unlike other children who were content with playing in the fields or helping with chores, Elara longed to explore the world beyond the village boundaries. One day, while wandering near the edge of the forest, Elara stumbled upon an ancient, weathered map hidden beneath a pile of leaves. The map depicted a path leading deep into the forest, to a place marked with a mysterious symbol. Her heart raced with excitement as she realized this could be the adventure she had always dreamed of." , sender:"bot"}]);
      setMessage(""); 
    }
  };

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
        {msg.text}
      </div>
    </div>
  ))}
</div> }




      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Ask Sam..."
          className="input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="send-button" onClick={handleSend}>
          <img src={Sent} className="send-logo" alt="Send Icon" />
        </button>
      </div>
    </div>
  );
}

export default PromptPage;
