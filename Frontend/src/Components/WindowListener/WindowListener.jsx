import { useEffect } from "react";



export function windowlistner(eventType, listener) {
    useEffect(() => {
        window.addEventListener(eventType, listener);
        return () => {
            window.removeEventListener(eventType, listener)
        }
    }, [eventType, listener])
}