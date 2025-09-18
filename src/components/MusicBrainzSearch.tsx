import { useState } from "react";
import { supabase } from "../utils/supabase";
import type { Artist, ReleaseGroup, NormalizedReleaseGroup } from "../../utils/types.ts";
import ReleaseGroupResult from "./ReleaseGroupResult.tsx";
import ArtistResult from "./ArtistResult.tsx";
import styles from "./MusicBrainzSearch.module.css";

export default function MusicBrainzSearch() {
    const [query, setQuery] = useState("");
    const [queryType, setQueryType] = useState("release");
    const [artistResults, setArtistResults] = useState<Artist[]>([]);
    const [releaseGroupResults, setReleaseGroupResults] = useState<NormalizedReleaseGroup[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        try {
            if (queryType === "release") {
                const releaseGroups = (await supabase.searchMusicBrainzReleaseGroup(query, queryType));
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
            <div className={styles["search"]}>
                <input className={styles["search-input"]} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="search releases..." />
                <select
                    value={queryType}
                    onChange={(e) => setQueryType(e.target.value)}
                >
                    <option>release</option>
                    <option>artist</option>
                </select>
                <button style={{ fontSize: "16px" }} onClick={handleSearch} disabled={loading}>
                    {loading ? "searching..." : "search"}
                </button>
            </div>
            <div className={styles["results"]}>
                {/* {queryType === "release" &&
                    releaseGroupResults.map((r: ReleaseGroup) => (
                        <SearchResult img={r.generalCoverUrl} title={r.title} subTitle={r.artists.map((a: any) => a.name).join(", ")} />
                    ))
                } */}
                {queryType === "release" &&
                    releaseGroupResults.map((r: NormalizedReleaseGroup) => (
                        <ReleaseGroupResult data={r}/>
                    ))
                }
                {queryType === "artist" &&
                    artistResults.map((a: Artist) => (
                        <ArtistResult data={a} />
                    ))
                }
            </div>
        </div>
    );
}
