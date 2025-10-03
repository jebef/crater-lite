import { useEffect } from "react";
import CrateReleaseCollection from "./CrateReleaseCollection";
import type { ReleaseGroup } from "../../utils/types";
import { Modal } from "../utils/Modal";
import styles from "./CratePopup.module.css";

export default function CratePopup({ releases, handleClose }: { releases: ReleaseGroup[], handleClose: () => void }) {
    useEffect(() => {
        document.body.style.overflow = "hidden"

        return () => {
            document.body.style.overflow = "";
        }
    })

    return (
        <Modal>
            <div className={styles["main"]}>
                <div className={styles["container"]}>
                    <div className={styles["cancel-button"]} onClick={handleClose}>
                        -
                    </div>
                    <br></br>
                    <div className={styles["releases"]}>
                        {releases && releases.map((r: ReleaseGroup) =>
                            <CrateReleaseCollection data={r} mode={1} />
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}