import { useState, useEffect } from "react";
import SearchResult from "./SearchResult";
import type { Artist, NormalizedReleaseGroup, Track, Label } from "../../utils/types";
import ReleasePopup from "./ReleasePopup";

export default function ReleaseGroupResult({ data }: { data: NormalizedReleaseGroup }) {
    const [showInfo, setShowInfo] = useState(false);

    const handleClick = () => {
        setShowInfo(!showInfo);
    }

    useEffect(() => {
        setShowInfo(false);
    }, [data]);

    const handleClose = () => {
        setShowInfo(false);
    }

    const handleAddClick = () => {
        console.log("Added to crate!");
    }

    

    return (
        <>
            <SearchResult
                img={data.coverUrl}
                title={data.title}
                subTitle={`${data.artists.map((a: Artist) => a.name).join(", ")} | ${data.type}`}
                onClick={handleClick}
            />
            <div>
                {/* {showInfo &&
                    <>
                        <br></br>
                        <img src={data.coverUrl} style={{ width: "60px", aspectRatio: "1/1"}}/>
                        <div>{data.title} | {data.firstReleaseYear} | {data.type}</div>
                        <div>{data.artists.map((a: Artist) => a.name).join(", ")}</div>
                        {
                            data.tracks.map((t: Track) => 
                                <div>{t.number} | {t.title} | {t.length}</div>
                            )
                        }
                        <div>{data.labels.map((l: Label) => l.name).join(", ")}</div>
                    </>
                } */}

                { showInfo && 
                    <ReleasePopup data={data} onAddClick={handleAddClick} onNoteClick={() => ""} onClose={handleClose}/>
                }
            </div>
        </>
    )
}