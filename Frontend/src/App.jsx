import { useState } from 'react'
import Login from './Components/Login/Login'
import Register from './Components/Register/Register'
import Body from './Pages/LandingPage/LandingPage'
import Nav from './Components/Nav/Nav'
import Footer from './Components/Footer/Footer'
import Header from './Components/Header/Header'
import Socials from './Pages/LandingPage/Socials/Socials'
import ChoosePage from './Pages/Choose/ChoosePage'
import PromptPage from './Pages/PromptPage/PromptPage'
import './App.css'

function App() {
   return (
      <div>
       {/* <Login /> */}
       {/* <Register /> */}
      {/* {<Body />} */}
      {/* <Footer />  */}
     {/* <Socials />  */}
       <PromptPage /> 
     {/* <Nav /> 
      <ChoosePage />
      <Footer /> */}
    
      </div>
   )
}

export default App
