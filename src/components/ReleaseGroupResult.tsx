import { useState, useEffect } from "react";
import SearchResult from "./SearchResult";
import type { Artist, NormalizedReleaseGroup, Track, Label } from "../../utils/types";
import { useCrate } from "../contexts/CrateContext";
import ReleasePopup from "./ReleasePopup";

export default function ReleaseGroupResult({ data, mode }: { data: NormalizedReleaseGroup, mode: number }) {
    const { state } = useCrate();
    const [showInfo, setShowInfo] = useState(false);

    const handleClick = () => {
        setShowInfo(!showInfo);
    }

    useEffect(() => {
        setShowInfo(false);
    }, [data]);

    const handleClose = () => {
        setShowInfo(false);
    }

    const handleAddClick = () => {
        console.log("Added to crate!");
    }

    return (
        <>
            <SearchResult
                img={data.coverUrl}
                title={data.title}
                subTitle={`${data.artists.map((a: Artist) => a.name).join(", ")} | ${data.type}`}
                onClick={handleClick}
                mode={mode}
            />
            <div>
                { showInfo && 
                    <ReleasePopup data={data} index={state.currentIndex} onClose={handleClose}/>
                }
            </div>
        </>
    )
}