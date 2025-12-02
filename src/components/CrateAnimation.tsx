import styles from "./CrateAnimation.module.css";

export default function CrateAnimation({ handleClick }: { handleClick: () => void }) {
    return (
        <div className={styles["container"]} onClick={handleClick}>
            <video
                src="/animations/crate-animation/output.webm"
                autoPlay
                loop
                muted
                playsInline
                style={{
                    width: "480px",
                    height: "270px",
                    imageRendering: "pixelated",
                    objectFit: "cover"
                }}
            />
        </div>
    );
}
