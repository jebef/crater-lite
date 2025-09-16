import { useState, useEffect } from "react";
import SearchResult from "./SearchResult";
import type { ReleaseGroup, Release, Artist } from "../../utils/types";

export default function ReleaseGroupResult({ data }: { data: ReleaseGroup }) {
    const [showReleases, setShowReleases] = useState(false);

    const handleClick = () => {
        setShowReleases(!showReleases);
    }

    useEffect(() => {
        setShowReleases(false);
    }, [data]);

    

    return (
        <>
            <SearchResult
                img={data.generalCoverUrl}
                title={data.title}
                subTitle={data.artists.map((a: Artist) => a.name).join(", ")}
                onClick={handleClick}
            />
            <div style={{paddingLeft: "30px"}}>
                {showReleases &&
                    data.releases.map((r: Release) => (
                        <SearchResult
                            img={r.coverUrl}
                            title={r.title}
                            subTitle={`${r.date?.slice(0,4)} | ${r.mediaType}`} // TODO: media type may be null 
                            onClick={() => { }}
                        />
                    ))
                }
            </div>
        </>
    )
}