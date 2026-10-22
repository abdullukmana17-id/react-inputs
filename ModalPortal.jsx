import { createPortal } from "react-dom";
import { useRef, useEffect } from "react";

export default function ModalPortal({ children }) {
    const elRef = useRef(document.createElement("div"));

    useEffect(() => {
        const modalRoot = document.body;
        modalRoot.appendChild(elRef.current);

        return () => {
            modalRoot.removeChild(elRef.current);
        };
    }, []);

    return createPortal(children, elRef.current);
}