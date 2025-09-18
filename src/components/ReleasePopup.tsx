import { Modal } from "./Modal";
import type { ReleasePopupProps, Artist, Label, Track } from "../../utils/types";
import QuestionMark from "/question-mark.png";
import styles from "./ReleasePopup.module.css";

function formatDuration(ms: number): string {
    if (!ms || ms <= 0) return "0:00";

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function ReleasePopup({ data, onAddClick, onClose }: ReleasePopupProps) {
    const imgSrc = data.coverUrl || QuestionMark;
    const imgClass = data.coverUrl ? "img" : "pixel-img";
    const trackCount = data.tracks.length;

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
                        <div style={{ marginTop: "auto"}}>
                            <div className={styles["cover-button"]} onClick={onAddClick}>+</div>
                            <div style={{ height: "15px"}}></div>
                            <div className={styles["cover-button"]}>n</div>
                        </div>
                    </div>
                    <div className={styles["text-info"]}>
                        <div>{data.title} | {data.firstReleaseYear}</div>
                        <div>{data.artists.map((a: Artist) => a.name).join(", ")}</div>
                        <div>{data.labels.map((l: Label) => l.name).join(", ")}</div>
                        { data.type && 
                            <div style={{ textTransform: "lowercase" }}>\{data.type}</div>
                        }
                        <div className={styles["track-list"]}>
                            {
                                data.tracks.map((t: Track) => {
                                    const duration = formatDuration(t.length);

                                    return (
                                        <>
                                            <div className={styles["track"]}>
                                                {/* {trackCount > 9 && t.number < 10 &&
                                                    <div>{t.number}&nbsp;</div>
                                                }
                                                {trackCount > 9 && t.number > 9 &&
                                                    <div>{t.number}</div>
                                                }
                                                {trackCount < 10 &&
                                                    <div>{t.number}</div>
                                                }
                                                {typeof trackCount !== "number" && 
                                                    <div>{t.number}</div>
                                                } */}
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