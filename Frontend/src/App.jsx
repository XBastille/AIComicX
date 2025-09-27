import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './Pages/auth/Login/Login'
import Register from './Pages/auth/Register/Register'
import Body from './Pages/LandingPage/LandingPage'
import ChoosePage from './Pages/Choose/ChoosePage'
import Nav from './Components/navigations/Nav/Nav'
import Footer from './Components/navigations/Footer/Footer'
import Conssole from './Pages/Conssole/Conssole'
import ConssoleNav from './Components/navigations/Nav/ConssoleNav'
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
            <Route path="/PromptPage" element={<PromptPage />} />
         </Routes>
      </Router>
      // <div>
      //    <Body />
      // </div>
   )
}

export default App
