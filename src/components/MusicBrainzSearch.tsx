import { useState } from "react";
import { supabase } from "../utils/supabase";
import type { Artist, ReleaseGroup } from "../../utils/types.ts";
import ReleaseGroupResult from "./ReleaseGroupResult.tsx";
import styles from "./MusicBrainzSearch.module.css";

export default function MusicBrainzSearch() {
    const [query, setQuery] = useState("");
    const [artistResults, setArtistResults] = useState<Artist[]>([]);
    const [releaseGroupResults, setReleaseGroupResults] = useState<ReleaseGroup[]>([]);
    const [loading, setLoading] = useState(false);

    // TODO: USER SHOULD SET THIS 
    const type = "release";

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        try {
            if (type === "release") {
                const releaseGroups = (await supabase.searchMusicBrainzReleaseGroup(query, type));
                setReleaseGroupResults(releaseGroups);
            } else {
                const artists = (await supabase.searchMusicBrainzArtist(query));
                setArtistResults(artists);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles["container"]}>
            <input style={{fontSize: "16px"}} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search releases..." />
            <button style={{fontSize: "16px"}} onClick={handleSearch} disabled={loading}>
                {loading ? "Searching..." : "Search"}
            </button>
            { 
                releaseGroupResults.map((r: ReleaseGroup) => (
                    <ReleaseGroupResult data={r}/>
                ))
            }
        </div>
    );
}
