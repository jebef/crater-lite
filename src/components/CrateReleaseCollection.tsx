import { useState, useEffect } from "react";
import SearchResult from "./SearchResult";
import type { Artist, ReleaseGroup } from "../../utils/types";
import CrateRelease from "./CrateRelease";

export default function CrateReleaseCollection({ data, mode }: { data: ReleaseGroup, mode: number }) {
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

    let subTitle = data.artists?.length > 0 ? `${data.artists?.map((a: Artist) => a.name).join(", ")}` : "";
    if (data.type !== "") {
        subTitle = subTitle !== "" ? `${subTitle} | ${data.type}` : data.type;
    }

    return (
        <>
            <SearchResult
                img={data.coverUrl}
                title={data.title}
                subTitle={subTitle}
                onClick={handleClick}
                mode={mode}
            />
            <div>
                {showInfo &&
                    <CrateRelease data={data} onClose={handleClose} />
                }
            </div>
        </>
    )
}