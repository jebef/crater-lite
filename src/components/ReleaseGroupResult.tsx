import { useState, useEffect } from "react";
import styles from "./ReleaseGroupResult.module.css";
import QuestionMark from "./../assets/question-mark.png";
import type { ReleaseGroup } from "../../utils/types.ts";

export default function ReleaseGroupResult({ data }: { data: ReleaseGroup }) {
    const [imgSrc, setImgSrc] = useState("");
    const [imgClass, setImgClass] = useState("");

    useEffect(() => {
        if (!data) return;

        if (!data.generalCoverUrl) {
            setImgSrc(QuestionMark);
            setImgClass("pixel-img");
        } else {
            setImgSrc(data.generalCoverUrl);
            setImgClass("img");
        }
    },[data]);

    return (
        <div className={styles["result-item"]}>
            <div className={styles["cover"]}>
                <img className={styles[`${imgClass}`]} src={imgSrc} alt="Cover Art"/>
            </div>
            <div className={styles["info"]}>
                <div className={styles["title"]}>{data.title}</div>
                <div className={styles["artist"]}>{data.artists.map((artist: any) => artist.name).join(", ")}</div>
            </div>
        </div>

    );
}