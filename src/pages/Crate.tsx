import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import Header from "../components/Header";
import CrateAnimation from "../components/CrateAnimation";
import CratePopup from "../components/CratePopup";
import Gram from "../components/Gram";
import type { SupaCrate, SupaReleaseGroup, SupaNote, ReleaseGroup, Artist, Label } from "../../utils/types";
import styles from "./Crate.module.css";

import FindFontSize from "../utils/FindFontSize";

export default function Crate() {
    const { key } = useParams();
    const [crate, setCrate] = useState<SupaCrate | null>(null);
    const [releases, setReleases] = useState<ReleaseGroup[]>([]);

    const [showCrate, setShowCrate] = useState(false);

    const handleCrateClick = () => {
        setShowCrate(true);
    }

    useEffect(() => {
        async function fetchCrate() {
            try {
                const { data: crate, error: crateError } = await supabase.client
                    .from("crates")
                    .select("*")
                    .eq("key", key)
                    .single();

                if (crateError) {
                    console.log("An error occured: ", crateError);
                    return;
                }

                const { data: supaReleaseGroups, error: releaseGroupError } = await supabase.client
                    .from("release_groups")
                    .select("*")
                    .eq("crate_id", crate.id);

                if (releaseGroupError) {
                    console.log("An error occured: ", releaseGroupError);
                    return;
                }

                const releaseGroups: ReleaseGroup[] = await Promise.all(
                    supaReleaseGroups.map(async (supaReleaseGroup: SupaReleaseGroup) => {
                        const r = await supabase.fetchMusicBrainzReleaseGroup(supaReleaseGroup.mbid);
                        return r;
                    })
                );

                // TODO: handle error throw? 

                // set state vars 
                setCrate(crate);
                setReleases(releaseGroups);
            } catch (err) {
                console.error("Error fetching crate data:", err);
            }
        }

        if (key) {
            fetchCrate();
        }
    }, [key]);


    if (!crate || !releases) return <p>Loading...</p>;

    return (
        <>
            <div className={styles["main-container"]}>
                <br></br>
                <div className={styles["animation-cropper"]}> 
                    <CrateAnimation handleClick={handleCrateClick} />
                </div>
                <br></br>
                <Gram crate={crate} />
            </div>
            { showCrate && 
                <CratePopup releases={releases}/>
            }
        </>
    );
}
