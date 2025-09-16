import { useState } from "react";
import Header from "../components/Header";
import MusicBrainzSearch from "../components/MusicBrainzSearch";
import styles from "./NewCrate.module.css";

export default function NewCrate() {
    const [showSearch, setShowSearch] = useState(false);

    const handleAddReleaseClick = () => {
        setShowSearch(true);
    }

    const handleCancelClick = () => {
        setShowSearch(false);
    }

    return (
        <div className={styles["container"]}>
            <Header />
            <br></br>
            <div className={styles["add-releases"]}>
                <div className={styles["add-button"]} onClick={handleAddReleaseClick}>
                    <span>+</span>
                </div>
                <div className={styles["add-text"]}>
                    add a release
                </div>
                <div className={styles["cancel-button"]} style={{
                    opacity: showSearch ? 1 : 0
                }} onClick={handleCancelClick}>
                    <span>-</span>
                </div>
            </div>
            <br></br>
            {
                showSearch &&
                <MusicBrainzSearch />
            }
        </div>
    )
}