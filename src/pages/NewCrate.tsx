import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./NewCrate.module.css";
import { CrateProvider } from "../contexts/CrateContext";
import CrateEditor from "./../components/CrateEditor";

export default function NewCrate() {
    return (
        <CrateProvider>
            <div className={styles["main-container"]}>
                <Header />
                <CrateEditor />
                <Footer />
            </div>
        </CrateProvider>
    )
}