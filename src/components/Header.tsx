import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

export default function Header() {

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