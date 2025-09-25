import { useRef, useState, useEffect } from "react";
import type { ReleaseGroup } from "../../utils/types";
import QuestionMark from "/images/question-mark.png";
import { Modal } from "../utils/Modal";
import styles from "./CratePopup.module.css";

export default function CratePopup({ releases }: { releases: ReleaseGroup[] }) {

    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "";
        }
    }, []);

    return (
        <Modal>
            <div className={styles["main"]}>
                <div className={styles["container"]}>
                </div>
            </div>
        </Modal>
    );
}