import { useEffect, useState, useRef } from "react";
import type { ReleaseGroup } from "../../utils/types";
import ImageStackScroller from "./ImageStackScroller";
import { Modal } from "../utils/Modal";
import styles from "./CratePopup.module.css";

export default function CratePopup({ releases }: { releases: ReleaseGroup[] }) {
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
                    <div style={{ width: "100%", aspectRatio: "1/1"}}>
                        <ImageStackScroller releases={releases}/>
                    </div>
                </div>
            </div>
        </Modal>
    );
}