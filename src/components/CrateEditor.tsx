import { useCrate } from "../contexts/CrateContext";
import AddRelease from "./AddRelease";
import type { ReleaseGroup, Crate } from "../../utils/types";
import ReleaseGroupResult from "./ReleaseGroupResult";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../utils/supabase";

import { useNavigate } from "react-router-dom";


import styles from "./CrateEditor.module.css";

export default function CrateEditor() {
    const { state, dispatch } = useCrate();
    const navigate = useNavigate();

    const handleSubmit = async () => {
        const key = uuidv4();
        const crate: Crate = {
            ...state,
            key: key
        }
        try {
            // save crate to supa db 
            await supabase.newCrate(crate);
            // navigate to crate page 
            navigate(`/crate/${key}`);
        } catch (err: any) {
            console.log("Error saving crate!", err.message);
        }
    }

    return (
        <div className={styles["main-container"]}>
            <input
                className={styles["title-input"]}
                type="text"
                id="title"
                placeholder="title"
                value={state.title}
                onChange={(e) => dispatch({ type: "SET_TITLE", payload: e.target.value })}
            />
            <input
                className={styles["to-name-input"]}
                type="text"
                id="to-name"
                placeholder="to:"
                value={state.toName}
                onChange={(e) => dispatch({ type: "SET_TO_NAME", payload: e.target.value })}
            />
            <input
                className={styles["from-name-input"]}
                type="text"
                id="from-name"
                placeholder="from:"
                value={state.fromName}
                onChange={(e) => dispatch({ type: "SET_FROM_NAME", payload: e.target.value })}
            />
            <textarea
                className={styles["description-input"]}
                id="description"
                placeholder="..."
                value={state.description}
                onChange={(e) => dispatch({ type: "SET_DESCRIPTION", payload: e.target.value })}
            />
            <div className={styles["releases-container"]}>
                {
                    state.releaseGroups.map((r: ReleaseGroup) => (
                        <ReleaseGroupResult
                            data={{
                                mbid: r.mbid,
                                title: r.title,
                                type: r.type,
                                coverUrl: r.coverUrl,
                                artists: r.artists,
                                tracks: r.tracks,
                                firstReleaseYear: r.firstReleaseYear,
                                labels: r.labels
                            }}
                            mode={0}
                        />
                    ))
                }
            </div>
            <AddRelease />
            <div className={styles["submit-button"]} onClick={handleSubmit}>
                fin
            </div>
        </div>
    )
}