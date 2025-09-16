import styles from "./Home.module.css";
import Header from "../components/Header";
import MusicBrainzSearch from "../components/MusicBrainzSearch";
import CrateAnimation from "../components/CrateAnimation";

export default function Home() {

    return (
        <div className={styles["container"]}>
            <Header/>
            <CrateAnimation/>
            <br></br>
            {/* <MusicBrainzSearch/> */}
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