import { useRef, useState, useEffect } from "react";
import Border from "/images/music-gram-border-3.png";
import SmallBorder from "/images/small-border.png";
import FindFontSize from "../utils/FindFontSize";
import type { SupaCrate } from "../../utils/types";
import styles from "./Gram.module.css";

export default function Gram({ crate }: { crate: SupaCrate }) {
    const toNameRef = useRef<HTMLDivElement | null>(null);
    const fromNameRef = useRef<HTMLDivElement | null>(null);

    const [toDims, setToDims] = useState<{ width: number; height: number } | null>(null);
    const [fromDims, setFromDims] = useState<{ width: number; height: number } | null>(null);

    const [toNameFontSize, setToNameFontSize] = useState(0);
    const [fromNameFontSize, setFromNameFontSize] = useState(0);
    const [nameFontSize, setNameFontSize] = useState(0);

    const toSizeFound = (fontSize: number) => setToNameFontSize(fontSize);
    const fromSizeFound = (fontSize: number) => setFromNameFontSize(fontSize);

    useEffect(() => {
        if (!toNameRef.current || !fromNameRef.current) return;

        const toObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setToDims({ width, height });
            }
        });
        const fromObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setFromDims({ width, height });
            }
        });

        toObserver.observe(toNameRef.current);
        fromObserver.observe(fromNameRef.current);

        return () => {
            toObserver.disconnect();
            fromObserver.disconnect();
        };
    }, [crate]);

    useEffect(() => {
        if (toNameFontSize === 0 || fromNameFontSize === 0) return;
        setNameFontSize(Math.min(toNameFontSize, fromNameFontSize));
    }, [toNameFontSize, fromNameFontSize]);

    useEffect(() => {
        setToNameFontSize(0);
        setFromNameFontSize(0);
        setNameFontSize(0);
    }, [crate]);

    const MAX_TILT = 5;
    const MIN_TILT = 2;
    const tilt = Math.floor(Math.random() * (MAX_TILT - MIN_TILT + 1)) + MIN_TILT;
    const orientation = Math.round(Math.random());

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
            {toDims && nameFontSize === 0 && (
                <FindFontSize
                    text={crate.to_name}
                    width={toDims.width}
                    height={toDims.height}
                    max={100}
                    onFound={toSizeFound}
                />
            )}
            {fromDims && nameFontSize === 0 && (
                <FindFontSize
                    text={crate.from_name}
                    width={fromDims.width}
                    height={fromDims.height}
                    max={100}
                    onFound={fromSizeFound}
                />
            )}
            <div
                className={styles["container"]}
                ref={gramRef}
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
                                        fontSize: nameFontSize,
                                        rotate: `${orientation === 0 ? tilt : -tilt}deg`
                                    }}
                                >
                                    <span>{nameFontSize !== 0 ? crate.to_name : ""}</span>
                                </div>
                            </div>
                            <div className={styles["name-block"]}>
                                <div className={styles["from"]}>from:</div>
                                <div
                                    className={styles["from-name"]}
                                    ref={fromNameRef}
                                    style={{
                                        fontSize: nameFontSize,
                                        rotate: `${orientation === 1 ? tilt : -tilt}deg`
                                    }}
                                >
                                    <span>{nameFontSize !== 0 ? crate.from_name : ""}</span>
                                </div>
                            </div>
                        </div>
                        <img className={styles["border-img"]} style={{ transform: "scaleX(-1)" }} src={Border} />
                    </>
                }
                {!showFront &&
                    <div className={styles["back"]}>
                        <div 
                            className={styles["crate-title"]}
                            // style={{
                            //     fontSize: nameFontSize
                            // }}
                        >
                            {crate.title.toUpperCase()}
                        </div>
                        <div className={styles["crate-description"]}>
                            {crate.description}
                        </div>
                    </div>
                }
            </div>
        </>
    );
}
