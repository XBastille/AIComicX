import React from "react";
import "./ChoosePage.css"

function ChoosePage() {
    return (
      <div className="Story-Container">
       
        <p className="Story-tag">
            Choose Your Story Format
        </p>

        <div className="Boxes">
           <div className="Box1">
               <img src=""></img>
               <p className="smallText">Dialogue-Story Style</p>
           </div>
           <div className="Box2">
               <img src=""></img>
               <p className="smallText">Story</p>
           </div>
           <div className="Box3">
               <img src=""></img>
               <p className="smallText">Generate Story</p>
           </div>
        </div>
    
      </div>
    )
}

export default ChoosePage;