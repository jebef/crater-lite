import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import Header from "../components/Header";
import type { SupaCrate } from "../../utils/types";
import styles from "./Crate.module.css";

export default function Crate() {
  const { key } = useParams(); 
  const [crate, setCrate] = useState<SupaCrate|null>(null);

  useEffect(() => {
    async function fetchCrate() {
      const { data, error } = await supabase.client
        .from("crates")
        .select("*")
        .eq("key", key)
        .single();

      if (error) console.error(error);
      else setCrate(data);
    }

    if (key) fetchCrate();
  }, [key]);

  if (!crate) return <p>Loading...</p>;

  return (
    <div className={styles["main-container"]}>
        <Header/>
        <div>To: {crate.to_name}</div>
        <div>From: {crate.from_name}</div>
        <div>{crate.title}</div>
        <div>{crate.description}</div>
    </div>
  );
}
