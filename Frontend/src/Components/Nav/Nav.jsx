import React , {useState}from "react";
import "./Nav.css"
import Header from "../Header/Header"



function Nav () {

  const[menuOpen , setMenuOpen] = useState(false)
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
    
  }



    return(
      <>
      <nav className="Navbar">
       <button className="play-btn">LOGIN</button>

       <div className="menu" onClick={toggleMenu}>
         <span className="menu-text">MENU</span>
       </div>
      </nav >

      
      <Header toggleMenu={toggleMenu} menuOpen={menuOpen} />
    
      </>
    )
}

export default Nav;