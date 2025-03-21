import React from "react";
import "./ConssoleNav.css"

function ConssoleNav(){
    return(
        <div className="navbar">
        <div className="style-options">
        <select className="art-options">
          <option value="Neutral(No Style)" >Neutral(No Style)</option>
          <option value="American">American</option>
          <option value="American(Modern)">American(Modern)</option>
          <option value="Egyptian">Egyptian</option>
          <option value="Medieval">Medieval</option>
          <option value="Flying Saucer">Flying Saucer</option>
          <option value="Flying Saucer">Flying Saucer</option>
          <option value="Flying Saucer">Flying Saucer</option>
          <option value="Flying Saucer">Flying Saucer</option>
        </select>

        <select className="grid-box">
            <option value="Grid 0">Grid 0</option>
            <option value="Grid 1">Grid 1</option>
            <option value="Grid 2">Grid 2</option>
            <option value="Grid 3">Grid 3</option>
        </select>
        </div>
  </div>
    )
}

export default ConssoleNav;