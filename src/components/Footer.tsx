import { useNavigate } from "react-router-dom";
import styles from "./Footer.module.css";

export default function Footer() {

    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/");
    }

    return (
        <div className={styles["container"]} onClick={handleClick}>
            crater
        </div>
    );
}