import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { Modal } from "../utils/Modal";
import styles from "./Footer.module.css";

export default function Footer() {
    const navigate = useNavigate();
    const [shareOpen, setShareOpen] = useState(false);
    const [shareMessage, setShareMessage] = useState("");

    const handleHomeClick = () => {
        navigate("/");
    }

    const handleShareClick = async () => {
        // copy page url to clipboard 
        try {
            await navigator.clipboard.writeText(window.location.href);
            setShareMessage("Crate URL copied to clipboard!")
            console.log("URL copied to clipboard");
        } catch (err) {
            console.error("Failed to copy to clipboard:", err);
        }

        // open sharing popup
        setShareOpen(true);
    }

    const handleShareClose = () => {
        setShareOpen(false);
    }

    return (
        <>
            <div className={styles["container"]}>
                <div className={styles["button"]} onClick={handleShareClick}>share</div>
                <div className={styles["button"]} onClick={handleHomeClick}>crater</div>
            </div>
            {shareOpen &&
                <Modal>
                    <div className={styles["popup-main"]}>
                        <div className={styles["popup-container"]}>
                            <div className={styles["close-button"]} onClick={handleShareClose}>-</div>
                            <div style={{ height: "64px" }} />
                            {shareMessage &&
                                <>
                                <div className={styles["popup-message"]}>
                                    {shareMessage}
                                </div>
                                <div style={{ height: "24px" }} />
                                </>
                            }
                            <div className={styles["popup-text"]}>
                                Crater is an accountless service - no onboarding, no personal 
                                data collection. 
                            </div>
                            <div style={{ height: "24px" }} />
                            <div className={styles["popup-text"]}>
                                To enable saving/sharing, each crate is assigned a unique key. 
                                You can locate this key by inspecting this page's URL.
                            </div>
                            <div style={{ height: "24px" }} />
                            <div className={styles["popup-text"]}>
                                Appending your key to the base URL below fetches your crate. 
                            </div>
                            <div style={{ height: "12px" }} />
                            <div style={{ textAlign: "center", color: "blueviolet" }}>
                                https://crater-lite.vercel.app/crate/<span style={{ color: "rgb(0,255,0)" }}>KEY</span>
                            </div>
                            <div style={{ height: "12px" }} />
                            <div className={styles["popup-text"]}>
                                Simply drop the link in an email or text to share.
                            </div>
                        </div>
                    </div>
                </Modal>
            }
        </>
    );
}