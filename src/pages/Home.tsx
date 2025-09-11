import styles from "./Home.module.css";
import MusicBrainzSearch from "../components/MusicBrainzSearch";

export default function Home() {

    return (
        <div className={styles["container"]}>
            <MusicBrainzSearch/>
        </div>
    );
}