import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import type { Artist, ReleaseGroup } from "../../utils/types.ts";
import { Modal } from "./../utils/Modal";

import ReleaseGroupResult from "./ReleaseGroupResult.tsx";
import ArtistResult from "./ArtistResult.tsx";

import styles from "./MusicBrainzSearch.module.css";

export default function MusicBrainzSearch({ handleClose }: { handleClose: () => void }) {
    const [query, setQuery] = useState("");
    const [queryType, setQueryType] = useState("release");
    const [artistResults, setArtistResults] = useState<Artist[]>([]);
    const [releaseGroupResults, setReleaseGroupResults] = useState<ReleaseGroup[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectType, setSelectType] = useState(false);

    // disable page scroll on popup mount 
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const handleTypeDropdownClick = () => {
        if (loading) return;
        setSelectType(!selectType);
    }

    const handleReleaseSelect = () => {
        setQueryType("release");
        setSelectType(false);
    }

    const handleArtistSelect = () => {
        setQueryType("artist");
        setSelectType(false);
    }



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
        <Modal>
            <div className={styles["main"]}>
                <div className={styles["container"]}>
                    <div className={styles["cancel-button"]} onClick={handleClose}>
                        -
                    </div>
                    <div className={styles["search"]}>
                        <div className={styles["search-bar"]}>
                            <input
                                className={styles["search-input"]}
                                id="search-input"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="search releases..."
                            />
                            <div className={styles["search-type"]} onClick={handleTypeDropdownClick}>
                                &lt;{queryType[0]}&gt;
                            </div>
                            <button className={styles["search-button"]} onClick={handleSearch} disabled={loading}>
                                search
                            </button>
                        </div>

                        {selectType &&
                            <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
                                <div className={styles["search-type-dropdown"]}>
                                    <button className={styles["search-release"]} onClick={handleReleaseSelect}>
                                        release
                                    </button>
                                    <button className={styles["search-artist"]} onClick={handleArtistSelect}>
                                        artist
                                    </button>
                                </div>
                                <div className={styles["search-button"]} style={{ opacity: "0" }}>
                                    search
                                </div>
                            </div>

                        }

                    </div>
                    {loading &&
                        <div style={{ fontSize: "18px" }}>
                            loading...
                        </div>
                    }
                    {!loading &&
                        <div className={styles["results"]}>
                            {queryType === "release" &&
                                releaseGroupResults.map((r: ReleaseGroup) => (
                                    <ReleaseGroupResult data={r} mode={1} />
                                ))
                            }
                            {queryType === "artist" &&
                                artistResults.map((a: Artist) => (
                                    <ArtistResult data={a} />
                                ))
                            }
                        </div>
                    }
                </div>
            </div>
        </Modal >
    )
}
