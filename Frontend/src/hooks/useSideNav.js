import React, { useEffect, useState } from "react"
import axios from "axios"
import { API_ENDPOINTS } from "../config/api";

export default function useSideNav() {
    const [sideNav, SetsideNav] = useState('');

    useEffect(() => {
        async function calling() {
            try {
                const res = await axios.get(API_ENDPOINTS.mdToFront);
                SetsideNav(res.data);
            } catch (error) {
                console.log(error + " unable to get story from backend!");
            }
        }
        calling();
    }, []);

    return { content: sideNav };
}