import { useEffect, useState, useRef } from "react";
import CrateReleaseCollection from "./CrateReleaseCollection";
import type { ReleaseGroup } from "../../utils/types";
import { Modal } from "../utils/Modal";
import styles from "./CratePopup.module.css";

export default function CratePopup({ title, releases, handleClose }: { title: string, releases: ReleaseGroup[], handleClose: () => void }) {
    useEffect(() => {
        document.body.style.overflow = "hidden"

        return () => {
            document.body.style.overflow = "";
        }
    })

    console.log(releases);

    return (
        <Modal>
            <div className={styles["main"]}>
                <div className={styles["container"]}>
                    <div className={styles["cancel-button"]} onClick={handleClose}>
                        -
                    </div>
                    {/* <div className={styles["title-card"]}>
                        {title}
                    </div> */}
                    { releases && releases.map((r: ReleaseGroup) => 
                        <CrateReleaseCollection data={r} mode={1}/>
                    )}
                </div>
            </div>
        </Modal>
    );
}