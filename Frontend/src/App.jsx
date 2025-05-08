import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Login from './Components/Login/Login'
import Register from './Components/Register/Register'
import Body from './Pages/LandingPage/LandingPage'
import ChoosePage from './Pages/Choose/ChoosePage'
import Nav from './Components/Nav/Nav'
import Footer from './Components/Footer/Footer'
import Conssole from './Pages/Conssole/Conssole'
import ConssoleNav from './Components/Nav/ConssoleNav'
import Grid1 from './Components/Grid/panel4/Grid1'
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
         {/* <PromptPage />  */}
         {/* <Nav /> 
      <ChoosePage />
      <Footer /> */}
      
      {/* <Conssole />
      <Grid1 /> */}
      <PromptPage />
      </div>
   )
}

export default App