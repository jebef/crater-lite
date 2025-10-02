import styles from "./SearchResult.module.css";
import QuestionMark from "/images/question-mark.png";

interface SearchResultParams {
    img: string | undefined;
    title: string;
    subTitle: string | undefined;
    onClick: () => void;
    mode: number; // 0 light, 1 dark
}

export default function SearchResult({ img, title, subTitle, onClick, mode }: SearchResultParams) {
    const imgSrc = img || QuestionMark;
    const imgClass = img ? "img" : "pixel-img";

    return (
        <div className={styles["result-item"]} onClick={onClick}>
            <div className={styles["cover"]}>
                <img className={styles[`${imgClass}`]} src={imgSrc} />
            </div>
            <div className={styles["info"]}>
                <div 
                    className={styles["title"]}
                    style={{
                        color: mode === 0 ? "black" : "whitesmoke"
                    }}
                >
                    {title}
                </div>
                <div 
                    className={styles["sub-title"]}
                    style={{
                        color: mode === 0 ? "black" : "whitesmoke"
                    }}
                >
                    {subTitle}
                </div>
            </div>
        </div>

    );
}