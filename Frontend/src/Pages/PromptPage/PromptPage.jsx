import React, { useState } from "react";
import "./PromptPage.css";
import Sam from "../../Picture/sam_2.png"
import Sent from "../../Picture/sent-icon.png"

function PromptPage() {
  const [showLogo, setShowLogo] = useState(true);
  const [message, setMessage] = useState("");

  const handle = () => {
    console.log("dfjbsdijfb")
    // if (message.trim() !== "") {
    //   setShowLogo(false); 
    //   setMessage(""); 
    // }
    console.log("Hello World")
  };


  return (

    <div className="container">
      <div className="dropdown">
        <select id="chatGpt">
          <option value="option1">Chat-Gpt 4.o</option>
          <option value="option2">Chat-Gpt 4.o mini</option>
        </select>
      </div>
      <div className={`Mascot ${showLogo ? "" : "hidden"}`} >
        <img src={Sam} className="Mascot-logo" />
      </div>



      <div className="search-bar">
        <input type="text" placeholder="Ask Sam" className="input" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter"} />
        <button onClick={handle}>hello</button>
      </div>
     
    </div>
  );
}


export default PromptPage;