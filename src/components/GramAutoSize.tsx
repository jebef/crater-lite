import { useRef, useState, useEffect } from "react";
import Border from "/images/music-gram-border-3.png";
import { useAutoFontSize } from "../utils/useAutoFontSize";
import type { SupaCrate } from "../../utils/types";
import styles from "./Gram.module.css";

export default function GramAutoSize({ crate }: { crate: SupaCrate }) {
    const toNameRef = useRef<HTMLDivElement | null>(null);
    const fromNameRef = useRef<HTMLDivElement | null>(null);

    const [toDims, setToDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const [fromDims, setFromDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    // Measure container dimensions after layout settles
    useEffect(() => {
        // Use requestAnimationFrame to ensure measurement happens after layout
        const measureDimensions = () => {
            if (toNameRef.current && fromNameRef.current) {
                // Force a reflow to ensure accurate measurements
                void toNameRef.current.offsetHeight;
                void fromNameRef.current.offsetHeight;

                const toBox = toNameRef.current.getBoundingClientRect();
                const fromBox = fromNameRef.current.getBoundingClientRect();

                setToDims({ width: toBox.width, height: toBox.height });
                setFromDims({ width: fromBox.width, height: fromBox.height });
            }
        };

        // Wait for next frame to measure
        requestAnimationFrame(() => {
            requestAnimationFrame(measureDimensions);
        });
    }, [crate]);

    // Use auto font sizing hook for both names
    const toNameFont = useAutoFontSize({
        text: crate.to_name,
        maxWidth: toDims.width,
        maxHeight: toDims.height,
        maxFontSize: 100,
        minFontSize: 18
    });

    const fromNameFont = useAutoFontSize({
        text: crate.from_name,
        maxWidth: fromDims.width,
        maxHeight: fromDims.height,
        maxFontSize: 100,
        minFontSize: 18
    });

    const MAX_TILT = 5;
    const MIN_TILT = 2;
    const [tilt, setTilt] = useState(0);
    const [orientation, setOrientation] = useState(0);

    useEffect(() => {
        setTilt(Math.floor(Math.random() * (MAX_TILT - MIN_TILT + 1)) + MIN_TILT);
        setOrientation(Math.round(Math.random()));
    }, [crate]);

    const [showFront, setShowFront] = useState(true);
    const gramRef = useRef<HTMLDivElement | null>(null);

    const handleClick = () => {
        const gram = gramRef.current;

        if (!gram) return;

        gram.style.transform = "scaleX(0)";
        gram.style.transition = "transform 0.5s ease-in-out";

        setTimeout(() => {
            gram.style.transform = "scaleX(1)";
            setShowFront(!showFront);
        }, 500);
    }

    return (
        <>
            {/* Hidden measurement spans for auto font sizing */}
            <span
                ref={toNameFont.measureRef}
                style={{
                    position: 'absolute',
                    visibility: 'hidden',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: -1
                }}
            >
                {crate.to_name}
            </span>
            <span
                ref={fromNameFont.measureRef}
                style={{
                    position: 'absolute',
                    visibility: 'hidden',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: -1
                }}
            >
                {crate.from_name}
            </span>

            <div
                className={styles["container"]}
                ref={gramRef}
                style={{
                    flexDirection: showFront ? "row" : "column",
                    justifyContent: showFront ? "space-between" : "flex-start"
                }}
                onClick={handleClick}
            >
                {showFront &&
                    <>
                        <img className={styles["border-img"]} src={Border} />
                        <div className={styles["greeting-container"]}>
                            <div className={styles["name-block"]}>
                                <div className={styles["to"]}>to:</div>
                                <div
                                    className={styles["to-name"]}
                                    ref={toNameRef}
                                    style={{
                                        flex: '1 1 auto',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        lineHeight: 1,
                                        textAlign: 'center',
                                        rotate: `${orientation === 0 ? tilt : -tilt}deg`
                                    }}
                                >
                                    <span style={{
                                        color: 'whitesmoke',
                                        fontSize: `${toNameFont.fontSize * 0.9}px`
                                    }}>
                                        {crate.to_name}
                                    </span>
                                </div>
                            </div>
                            <div className={styles["name-block"]}>
                                <div className={styles["from"]}>from:</div>
                                <div
                                    className={styles["from-name"]}
                                    ref={fromNameRef}
                                    style={{
                                        flex: '1 1 auto',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        lineHeight: 1,
                                        textAlign: 'center',
                                        rotate: `${orientation === 1 ? tilt : -tilt}deg`
                                    }}
                                >
                                    <span style={{
                                        color: 'whitesmoke',
                                        fontSize: `${fromNameFont.fontSize * 0.9}px`
                                    }}>
                                        {crate.from_name}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <img className={styles["border-img"]} style={{ transform: "scaleX(-1)" }} src={Border} />
                    </>
                }
                {!showFront &&
                    <>
                        <div className={styles["crate-title"]}>
                            {crate.title.toUpperCase()}
                        </div>
                        <div className={styles["crate-description"]}>
                            {crate.description}
                        </div>
                    </>
                }
            </div>
        </>
    );
}