import { useState, useEffect } from "react";
import SearchResult from "./SearchResult";
import type { ReleaseGroup, Release, Artist } from "../../utils/types";

export default function ArtistResult({ data }: { data: Artist }) {
    const [showReleaseGroups, setShowReleaseGroups] = useState(false);

    const handleClick = () => {
        setShowReleaseGroups(!showReleaseGroups);
    }

    useEffect(() => {
        setShowReleaseGroups(false);
    }, [data]);

    return (
        <>
            <SearchResult
                img={undefined}
                title={data.name}
                subTitle={data.type}
                onClick={handleClick}
            />
            {/* <div style={{paddingLeft: "30px"}}>
                {showReleaseGroups &&
                    data.releases.map((r: Release) => (
                        <SearchResult
                            img={r.coverUrl}
                            title={r.title}
                            subTitle={`${r.date?.slice(0,4)} | ${r.mediaType}`} // TODO: media type may be null 
                            onClick={() => { }}
                        />
                    ))
                }
            </div> */}
        </>
    )
}