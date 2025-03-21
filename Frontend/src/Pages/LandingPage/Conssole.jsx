import React from "react";
import "./Conssole.css"
import ConssoleNav from "../../Components/Nav/ConssoleNav";
import ConssoleFooter from "../../Components/Footer/ConssoleFooter";
import { Outlet } from "react-router-dom";


function Conssole(){
    return(
    <>
    <ConssoleNav />
    <ConssoleFooter />
    </>
    
    )
}

export default Conssole;