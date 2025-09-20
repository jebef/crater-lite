import { useState } from "react";
import MusicBrainzSearch from "./MusicBrainzSearch";
import styles from "./AddRelease.module.css";

export default function AddRelease() {
    const [showSearch, setShowSearch] = useState(false);

    const handleAddClick = () => {
        setShowSearch(true);
    }

    const handleCancelClick = () => {
        setShowSearch(false);
    }

    return (
        <>
            <div className={styles["add-release"]}>
                <div className={styles["add-button"]} onClick={handleAddClick}>
                    +
                </div>
                <div className={styles["add-text"]}>
                    add a release
                </div>
                <div className={styles["add-button"]} style={{ opacity: "0" }} />
            </div>

            { showSearch && <MusicBrainzSearch handleClose={handleCancelClick} /> }
        </>
    )
}