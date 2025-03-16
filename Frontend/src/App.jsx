import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Components/Login/Login'
import Register from './Components/Register/Register'
import Body from './Pages/LandingPage/LandingPage'
import ChoosePage from './Pages/LandingPage/Choose/ChoosePage'
import Nav from './Components/Nav/Nav'
import Footer from './Components/Footer/Footer'
import Header from './Components/Header/Header'
import './App.css'

function App() {
   return (
      <BrowserRouter>
         <div>
            <Nav />
            <Routes>
               <Route path="/" element={<Body />} />
               <Route path="/choose" element={<ChoosePage />} />
               <Route path="/login" element={<Login />} />
               <Route path="/register" element={<Register />} />
            </Routes>
            <Footer />
         </div>
      </BrowserRouter>
   )
}

export default App