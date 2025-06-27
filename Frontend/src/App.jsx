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
import LoadingAnimation from './Components/LoadingAnimation/LoadingAnimation'
// import LoadingAnimation2 from './Components/LoadingAnimation/LoadingAnimation2'

import './App.css'

function App() {
   const [isInitialLoading, setIsInitialLoading] = useState(true);

   const handleLoadingComplete = () => {
      setIsInitialLoading(false);
   };

   if (isInitialLoading) {
      return <LoadingAnimation onComplete={handleLoadingComplete} />;
   }

   // if (isInitialLoading) {
   //    return <LoadingAnimation2 />;
   // }

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
   )
}

export default App