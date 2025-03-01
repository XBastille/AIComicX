import { useState } from 'react'
import Login from './Components/Login/Login'
import Register from './Components/Register/Register'
import Body from './Pages/LandingPage/LandingPage'
import Nav from './Components/Nav/Nav'
import Footer from './Components/Footer/Footer'
import Header from './Components/Header/Header'
import './App.css'

function App() {
   return (
      <div>
       {/* <Login /> */}
       {/* <Register /> */}
      { <Nav /> }
       {<Body />}
       <Footer /> 
       
      </div>
   )
}

export default App
