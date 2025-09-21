import { useState, useEffect } from "react";
import SearchResult from "./SearchResult";
import type { Artist, ReleaseGroup } from "../../utils/types";
import { useCrate } from "../contexts/CrateContext";
import ReleasePopup from "./ReleasePopup";

export default function ReleaseGroupResult({ data, mode }: { data: ReleaseGroup, mode: number }) {
    const { state } = useCrate();
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        setShowInfo(false);
    }, [data]);

    const handleClick = () => {
        setShowInfo(!showInfo);
    }

    const handleClose = () => {
        setShowInfo(false);
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
                {showInfo &&
                    <ReleasePopup data={data} index={state.currentIndex} onClose={handleClose} />
                }
            </div>
        </>
    )
}