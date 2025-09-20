import { useState } from "react";
import Header from "../components/Header";
import MusicBrainzSearch from "../components/MusicBrainzSearch";
import styles from "./NewCrate.module.css";

import { CrateProvider } from "../contexts/CrateContext";
import CrateEditor from "./../components/CrateEditor";

export default function NewCrate() {
    const [showSearch, setShowSearch] = useState(false);

    const handleAddReleaseClick = () => {
        setShowSearch(true);
    }

    const handleCancelClick = () => {
        setShowSearch(false);
    }

    return (
        <CrateProvider>
            <Header/>
            <CrateEditor/>
        </CrateProvider>
    )
}