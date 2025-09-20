import { useState } from "react";
import { useCrate } from "../contexts/CrateContext";
import { Modal } from "../utils/Modal";
import type { ReleasePopupProps, SupaReleaseGroup, Artist, Label, Track } from "../../utils/types";
import QuestionMark from "/question-mark.png";
import styles from "./ReleasePopup.module.css";

/* 
    A simple helper for formatting track times
*/
function formatDuration(ms: number): string {
    if (!ms || ms <= 0) return "0:00";

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/* 
    Displays normalized release group info,
    enables users to add release to their crate 
*/
export default function ReleasePopup({ data, index, onClose }: ReleasePopupProps) {
    const { dispatch } = useCrate();
    const [isAdded, setIsAdded] = useState(false);
    const imgSrc = data.coverUrl || QuestionMark;
    const imgClass = data.coverUrl ? "img" : "pixel-img";
    const trackCount = data.tracks.length;

    const handleAddClick = () => {
        if (!isAdded) {
            const payload: SupaReleaseGroup = {
                mbid: data.mbid,
                index: index,
                title: data.title,
                type: data.type,
                coverUrl: data.coverUrl,
                artists: data.artists,
                firstReleaseYear: data.firstReleaseYear,
                tracks: data.tracks,
                labels: data.labels
            }
            dispatch({ type: "ADD_RELEASE_GROUP", payload: payload });
            setIsAdded(true);
            console.log("release added!")
        } else {
            dispatch({ type: "REMOVE_RELEASE_GROUP", payload: index });
            setIsAdded(false);
            console.log("release removed")
        }
    }

    return (
        <Modal>
            <div className={styles["main"]}>
                <div
                    className={styles["container"]}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={styles["close-button"]} onClick={onClose}>x</div>

                    <div className={styles["cover-hub"]}>
                        <div className={styles["cover"]}>
                            <img className={styles[`${imgClass}`]} src={imgSrc} />
                        </div>
                        <div style={{ marginTop: "auto" }}>
                            <div
                                className={styles["cover-button"]}
                                style={{
                                    color: isAdded ? "green" : "whitesmoke",
                                    borderColor: isAdded ? "green" : "whitesmoke"

                                }}
                                onClick={handleAddClick}
                            >
                                +
                            </div>
                            <div style={{ height: "15px" }}></div>
                            <div className={styles["cover-button"]}>
                                n
                            </div>
                        </div>
                    </div>
                    <div className={styles["text-info"]}>
                        <div>{data.title} | {data.firstReleaseYear}</div>
                        <div>{data.artists.map((a: Artist) => a.name).join(", ")}</div>
                        <div>{data.labels.map((l: Label) => l.name).join(", ")}</div>
                        {data.type &&
                            <div style={{ textTransform: "lowercase" }}>\{data.type}</div>
                        }
                        <div className={styles["track-list"]}>
                            {
                                data.tracks.map((t: Track) => {
                                    const duration = formatDuration(t.length);

                                    return (
                                        <>
                                            <div className={styles["track"]}>
                                                <div>
                                                    {trackCount > 9 && !isNaN(Number(t.number)) && Number(t.number) < 10
                                                        ? `${t.number}\u00A0`
                                                        : t.number}
                                                </div>

                                                <div style={{
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis"
                                                }}>
                                                    {`\u00A0${t.title}`}
                                                </div>
                                                <div style={{
                                                    marginLeft: "auto"
                                                }}>
                                                    {`\u00A0${duration}`}
                                                </div>
                                            </div>
                                        </>
                                    )
                                })
                            }
                        </div>

                    </div>
                </div>
            </div>
        </Modal>
    )
}