import { useState } from "react";
import SearchResult from "./SearchResult";
import type { Artist } from "../../utils/types";
import ArtistReleases from "./ArtistReleases";

export default function ArtistResult({ data }: { data: Artist }) {
    const [showReleases, setShowReleases] = useState(false);

    const handleClick = async () => {
        setShowReleases(true);
    }

    const handleClose = () => {
        setShowReleases(false);
    }

    return (
        <>
            <SearchResult
                img={undefined}
                title={data.name}
                subTitle={data.type}
                onClick={handleClick}
                mode={1}
            />
            { showReleases && 
                <ArtistReleases mbid={data.mbid} name={data.name} handleClose={handleClose}/>
            }
        </>
    )
}