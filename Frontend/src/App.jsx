import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './Components/Login/Login'
import Register from './Components/Register/Register'
import Body from './Pages/LandingPage/LandingPage'
import ChoosePage from './Pages/Choose/ChoosePage'
import Nav from './Components/Nav/Nav'
import Footer from './Components/Footer/Footer'
import Conssole from './Pages/Conssole/Conssole'
import ConssoleNav from './Components/Nav/ConssoleNav'
import One from './Components/Grid/panel1/One';
import PromptPage from './Pages/PromptPage/PromptPage'

import './App.css'

function App() {
   return (
      <Router>
         <Routes>
            <Route path='/' element={<Body />} />

            {/* Authentication Routes */}
            <Route path='/user/Register' element={<Register />} />
            <Route path='/user/Login' element={<Login />} />


            {/*Main Pages routing */}

            <Route path="/SelectPage" element={<ChoosePage />} />
            <Route path="/Generate_Story" element={<Conssole />} />
         </Routes>
      </Router>
      // <div>
      //    <Body />
      // </div>
   )
}

export default App