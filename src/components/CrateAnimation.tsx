import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CrateAnimation.module.css";

export default function CrateAnimation() {
    const navigate = useNavigate();
    const frameCount = 120; 
    const fps = 12;
    const [frame, setFrame] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setFrame((prev) => (prev % frameCount) + 1);
        }, 1000 / fps); 
        return () => clearInterval(interval);
    }, []);

    const handleClick = () => {
        return navigate("/new-crate");
    }

    const frameStr = String(frame).padStart(4, "0"); 
    const src = `/animations/crate-animation/${frameStr}.png`;

    return (
        <div className={styles["container"]} onClick={handleClick}>
            <img
            src={src}
            alt="Rotating Cube"
            style={{
                width: "480px",
                height: "270px",
                imageRendering: "pixelated"
            }}
        />
        </div>
    );
}
