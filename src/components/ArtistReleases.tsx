import { useEffect, useState } from "react";
import ReleaseGroupResult from "./ReleaseGroupResult";
import { supabase } from "../utils/supabase";
import type { ReleaseGroup } from "../../utils/types";
import { Modal } from "../utils/Modal";
import styles from "./ArtistReleases.module.css";

export default function ArtistReleases({ mbid, name, handleClose }: { mbid: string, name: string, handleClose: () => void }) {
    const [loading, setLoading] = useState(true);
    const [releaseGroups, setReleaseGroups] = useState<ReleaseGroup[]>([]);

    useEffect(() => {
        const fetchReleaseGroups = async () => {
            const rgs = await supabase.searchMusicBrainzReleaseGroup(mbid, "artist");
            setReleaseGroups(rgs);
            setLoading(false);
        }
        fetchReleaseGroups();
    }, []);

    return (
        <Modal>
            <div className={styles["main"]}>
                <div className={styles["container"]}>
                    <div className={styles["cancel-button"]} onClick={handleClose}>
                        -
                    </div>
                    <br></br>
                    { loading && 
                        <div className={styles["loading-message"]}>
                            {`loading releases from ${name}...`}
                        </div>
                    }
                    <div className={styles["releases"]}>
                        {releaseGroups &&
                            releaseGroups.map((release: ReleaseGroup) =>
                                <ReleaseGroupResult data={release} mode={1} />
                            )
                        }
                    </div>
                </div>
            </div>
        </Modal>
    )
}