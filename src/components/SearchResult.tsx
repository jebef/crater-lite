import styles from "./SearchResult.module.css";
import QuestionMark from "/question-mark.png";

interface SearchResultParams {
    img: string | undefined;
    title: string;
    subTitle: string | undefined;
    onClick: () => void;
}

export default function SearchResult({ img, title, subTitle, onClick }: SearchResultParams) {
    const imgSrc = img || QuestionMark;
    const imgClass = img ? "img" : "pixel-img";

    return (
        <div className={styles["result-item"]} onClick={onClick}>
            <div className={styles["cover"]}>
                <img className={styles[`${imgClass}`]} src={imgSrc} />
            </div>
            <div className={styles["info"]}>
                <div className={styles["title"]}>{title}</div>
                <div className={styles["sub-title"]}>{subTitle}</div>
            </div>
        </div>

    );
}