import { useEffect } from "react";
import { Modal } from "../utils/Modal";
import type { ReleasePopupProps, Artist, Label, Track } from "../../utils/types";
import QuestionMark from "/images/question-mark.png";
import styles from "./CrateRelease.module.css";

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
    View a release 
*/
export default function CrateRelease({ data, onClose }: ReleasePopupProps) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    /*
        Opens MusicBrainz page for this release group in a new tab
    */
    const handleLinkClick = () => {
        window.open(`https://musicbrainz.org/release-group/${data.mbid}`, "_blank");
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
                                onClick={handleLinkClick}
                            >
                                !
                            </div>
                        </div>
                    </div>
                    <div
                        className={styles["text-info"]}
                        style={{
                            paddingTop: "15px"
                        }}
                    >
                        {title}
                    </div>
                    {artists &&
                        <div className={styles["text-info"]}>
                            {artists}
                        </div>
                    }
                    {labels &&
                        <div className={styles["text-info"]}>
                            {labels}
                        </div>
                    }
                    {data.type &&
                        <div
                            className={styles["text-info"]}
                            style={{ textTransform: "lowercase" }}
                        >
                            \{data.type}
                        </div>
                    }
                    <div className={styles["track-list"]}>
                        {data.tracks &&
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
        </Modal>
    )
}