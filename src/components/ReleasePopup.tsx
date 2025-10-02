import { useState, useEffect, useRef } from "react";
import { useCrate } from "../contexts/CrateContext";
import { Modal } from "../utils/Modal";
import type { ReleasePopupProps, ReleaseGroup, Artist, Label, Track } from "../../utils/types";
import QuestionMark from "/images/question-mark.png";
import styles from "./ReleasePopup.module.css";

/* 
    A simple helper for formatting track times
*/
function formatDuration(ms: number): string {
    if (!ms || ms <= 0) return "";

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/* 
    Engage with a release 
*/
export default function ReleasePopup({ data, onClose }: ReleasePopupProps) {
    const { state, dispatch } = useCrate();
    const [addToCrate, setAddToCrate] = useState(false);
    const dispatchType = useRef<"none" | "add" | "remove">("none");
    const inCrate = useRef(false);

    useEffect(() => {
        // determine if release is in crate 
        if (state.releaseGroups.some(r => r.mbid === data.mbid)) {
            console.log("release already in crate");
            inCrate.current = true;
            setAddToCrate(true);
        }

        // disable page scroll 
        document.body.style.overflow = "hidden";
        return () => {
            // re-enable on dismount 
            document.body.style.overflow = "";

            // send dispatch? 
            if (dispatchType.current === "add" && inCrate.current === false) {
                dispatch({ type: "ADD_RELEASE_GROUP", payload: data });
                console.log(`Release added!\nMBID: ${data.mbid}\n`);
            }
            if (dispatchType.current === "remove" && inCrate.current === true) {
                dispatch({ type: "REMOVE_RELEASE_GROUP", payload: data.mbid });
                console.log(`Release removed!\nMBID: ${data.mbid}\n`);
            }
        };
    }, []);

    const handleAddClick = () => {
        if (!addToCrate) {
            setAddToCrate(true);
            dispatchType.current = "add";
        } else {
            setAddToCrate(false);
            dispatchType.current = "remove";
        }
    }

    // display fields 
    const imgSrc = data.coverUrl || QuestionMark;
    const imgClass = data.coverUrl ? "img" : "pixel-img";
    const trackCount = data.tracks?.length;
    const title = data.firstReleaseYear ? `${data.title} | ${data.firstReleaseYear}` : data.title;
    const artists = data.artists?.map((a: Artist) => a.name).join(", ");
    const labels = data.labels?.map((l: Label) => l.name).join(", ");

    return (
        <Modal>
            <div className={styles["main"]}>
                <div
                    className={styles["container"]}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={styles["close-button"]} onClick={onClose}>
                        x
                    </div>

                    <div className={styles["cover-hub"]}>
                        <div className={styles["cover"]}>
                            <img className={styles[`${imgClass}`]} src={imgSrc} />
                        </div>
                        <div style={{ marginTop: "auto" }}>
                            <div
                                className={styles["cover-button"]}
                                style={{
                                    color: addToCrate ? "green" : "whitesmoke",
                                    borderColor: addToCrate ? "green" : "whitesmoke"

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
                        <div>{title}</div>
                        {artists && <div>{artists}</div>}
                        {labels && <div>{labels}</div>}
                        {data.type &&
                            <div style={{ textTransform: "lowercase" }}>\{data.type}</div>
                        }
                        <div className={styles["track-list"]}>
                            { data.tracks && 
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