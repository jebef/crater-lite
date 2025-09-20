import { useState, useEffect } from "react";
import { useCrate } from "../contexts/CrateContext";
import AddRelease from "./AddRelease";
import type { SupaReleaseGroup, Artist } from "../../utils/types";
import ReleaseGroupResult from "./ReleaseGroupResult";

import styles from "./CrateEditor.module.css";

export default function CrateEditor() {

    const { state, dispatch } = useCrate();

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
            <div>
                {
                    state.releaseGroups.map((r: SupaReleaseGroup) => (
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
        </div>
    )
}