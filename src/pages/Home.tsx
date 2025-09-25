import styles from "./Home.module.css";
import Header from "../components/Header";
import CrateAnimation from "../components/CrateAnimation";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    const handleCrateClick = () => {
        navigate("/new-crate")
    }

    return (
        <div className={styles["container"]}>
            <Header />
            <CrateAnimation handleClick={handleCrateClick} />
            <div className={styles["text"]} style={{ rotate: "-3deg" }}>
                gift a digital music gram today!
            </div>
            <br></br>
            <div className={styles["text"]} style={{ rotate: "1deg" }}>
                often, music is consumed in single or partial track portions.
                a whole release reduced to its shiniest bits.
                show a loved one all they are missing...
            </div>
            <br></br>
            <div className={styles["text"]} >
                tap the crate to get started
            </div>
        </div>
    );
}