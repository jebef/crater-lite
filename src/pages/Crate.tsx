import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import CrateAnimation from "../components/CrateAnimation";
import CratePopup from "../components/CratePopup";
import GramAutoSize from "../components/GramAutoSize";
import type { SupaCrate, ReleaseGroup } from "../../utils/types";
import styles from "./Crate.module.css";
import Footer from "../components/Footer";

export default function Crate() {
    const { key } = useParams();
    const [crate, setCrate] = useState<SupaCrate | null>(null);
    const [releases, setReleases] = useState<ReleaseGroup[]>([]);

    const [showCrate, setShowCrate] = useState(false);

    const [errorMessage, setErrorMessage] = useState("")

    const handleCrateClick = () => {
        setShowCrate(true);
    }

    const handleCrateClose = () => {
        setShowCrate(false);
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
                    console.error("Database error fetching crate:", crateError);
                    setErrorMessage("Crate not found. Please check the URL.");
                    return;
                }

                const { data: supaReleaseGroups, error: releaseGroupError } = await supabase.client
                    .from("release_groups")
                    .select("*")
                    .eq("crate_id", crate.id)
                    .order("index");

                if (releaseGroupError) {
                    console.error("Database error fetching releases:", releaseGroupError);
                    setErrorMessage("Failed to load crate releases. Please try again.");
                    return;
                }

                // Load releases sequentially to reduce rate limiting
                const releaseGroups: ReleaseGroup[] = [];
                for (const supaReleaseGroup of supaReleaseGroups) {
                    try {
                        const release = await supabase.fetchMusicBrainzReleaseGroup(supaReleaseGroup.mbid);
                        releaseGroups.push(release);
                    } catch (err: any) {
                        console.error(`Failed to fetch release ${supaReleaseGroup.mbid}:`, err);
                        // Continue loading other releases instead of failing completely
                    }
                }

                if (releaseGroups.length === 0 && supaReleaseGroups.length > 0) {
                    setErrorMessage("Failed to load releases. MusicBrainz may be temporarily unavailable.");
                    return;
                }

                setCrate(crate);
                setReleases(releaseGroups);
            } catch (err) {
                console.error("Error fetching crate data:", err);
                setErrorMessage("An unexpected error occurred. Please try again.");
            }
        }

        if (key) {
            fetchCrate();
        }
    }, [key]);

    if (errorMessage) return <div className={styles["message"]}>{errorMessage}</div>;

    if (!crate || !releases) return <div className={styles["message"]}>Loading...</div>;

    return (
        <>
            <div className={styles["main-container"]}>
                <br></br>
                <div className={styles["animation-cropper"]}> 
                    <CrateAnimation handleClick={handleCrateClick} />
                </div>
                <br></br>
                {/* <Gram crate={crate} /> */}
                <GramAutoSize crate={crate} />
                <br></br>
                <Footer/>
                <br></br>
            </div>
            { showCrate && 
                <CratePopup releases={releases} handleClose={handleCrateClose}/>
            }
        </>
    );
}
