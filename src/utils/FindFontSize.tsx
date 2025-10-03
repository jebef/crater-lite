import { useRef, useState, useEffect } from "react";

interface FindFontSizeParams {
    text: string;
    width: number;
    height: number;
    max: number;
    onFound: (fontSize: number) => void;
}

export default function FindFontSize({ text, width, height, max, onFound }: FindFontSizeParams) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [fontSize, setFontSize] = useState(max);
    const fontStep = 0.95;

    useEffect(() => {
        if (!containerRef.current) return;

        const findFont = () => {
            setFontSize(fontSize * fontStep);
        }

        const containerHeight = containerRef.current.getBoundingClientRect().height;

        if (containerHeight > height) {
            findFont();
        } else {
            console.log("Final size: ", fontSize);
            onFound(fontSize);
        }

    }, [fontSize]);

    return (
        <div
            style={{
                position: "fixed",
                top: "0",
                left: "0",
                width: `${width}px`,
                lineHeight: "1",
                fontSize: `${fontSize}px`,
                whiteSpace: "normal", 
                wordWrap: "break-word", 
                opacity: "0",
                zIndex: "-1"
            }}
            ref={containerRef}
        >
            {text}
        </div>
    )
}