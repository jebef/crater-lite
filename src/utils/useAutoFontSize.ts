import { useEffect, useState, useRef } from 'react';

interface UseAutoFontSizeOptions {
    text: string;
    maxWidth: number;
    maxHeight: number;
    minFontSize?: number;
    maxFontSize?: number;
}

/**
 * Custom hook that automatically calculates optimal font size to fit text within constraints
 * Uses binary search algorithm for efficient computation
 *
 * @param text - The text to be sized
 * @param maxWidth - Maximum width in pixels
 * @param maxHeight - Maximum height in pixels
 * @param minFontSize - Minimum font size (default: 12px)
 * @param maxFontSize - Maximum font size (default: 100px)
 *
 * @returns { fontSize, measureRef } - Optimal font size and ref for measurement element
 *
 * @example
 * const { fontSize, measureRef } = useAutoFontSize({
 *   text: "Hello World",
 *   maxWidth: 200,
 *   maxHeight: 50,
 *   maxFontSize: 100
 * });
 *
 * return (
 *   <>
 *     <span ref={measureRef} style={{ visibility: 'hidden', position: 'absolute' }}>
 *       {text}
 *     </span>
 *     <div style={{ fontSize }}>{text}</div>
 *   </>
 * );
 */
export function useAutoFontSize({
    text,
    maxWidth,
    maxHeight,
    minFontSize = 18,
    maxFontSize = 100
}: UseAutoFontSizeOptions) {
    const [fontSize, setFontSize] = useState<number>(maxFontSize);
    const measureRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!measureRef.current || !text || maxWidth <= 0 || maxHeight <= 0) {
            return;
        }

        // Binary search for optimal font size
        let low = minFontSize;
        let high = maxFontSize;
        let optimalSize = minFontSize;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            measureRef.current.style.fontSize = `${mid}px`;

            const bounds = measureRef.current.getBoundingClientRect();

            // Check if text fits within constraints
            if (bounds.width <= maxWidth && bounds.height <= maxHeight) {
                optimalSize = mid;
                low = mid + 1; // Try larger font size
            } else {
                high = mid - 1; // Try smaller font size
            }
        }

        setFontSize(optimalSize);
    }, [text, maxWidth, maxHeight, minFontSize, maxFontSize]);

    return { fontSize, measureRef };
}