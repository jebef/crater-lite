import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Crate } from "./types";
import type { Artist, ReleaseGroup } from "../../utils/types.ts";

class SupaAPI {
    URL: string;
    ANON_KEY: string;
    client: SupabaseClient;

    constructor() {
        this.URL = import.meta.env.VITE_SUPABASE_URL;
        this.ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

        this.client = createClient(
            this.URL,
            this.ANON_KEY
        );
    }

    async searchMusicBrainzArtist(query: string): Promise<Artist[]> {
        const { data, error } = await this.client.functions.invoke("search-mb-artist", {
            body: { 
                query
            },
        });

        if (error) {
            console.error("Error searching MusicBrainz DB: ", error.message);
            throw error;
        }

        console.log("Search results: ", data);

        return data.results;
    }

    async searchMusicBrainzReleaseGroup(query: string, type: string = "release"): Promise<ReleaseGroup[]> {
        const { data, error } = await this.client.functions.invoke("search-mb-release-groups", {
            body: { 
                query,
                type
            },
        });

        if (error) {
            console.error("Error searching MusicBrainz DB: ", error.message);
            throw error;
        }

        console.log("Search results: ", data);

        return data.results;
    }

    async newCrate(crate: Omit<Crate, "id">): Promise<void> {
        const { error } = await this.client
            .from("crates")
            .insert([crate]);

        if (error) {
            console.error("Error inserting crate: ", error.message);
            throw error;
        }

        console.log("New crate added to db!");
    }

    async getCrate(id: string, key: string | null): Promise<Crate> {
        let query = this.client.from("crates").select().eq("id", id);

        if (key !== null) {
            query = query.eq("key", key);
        } else {
            query = query.is("key", null);
        }

        const { data, error } = await query.single();

        if (error) {
            console.error("Error fetching crate: ", error.message);
            throw error;
        }

        if (!data) {
            console.error("Unknown error fetching crate, please try again.");
            throw new Error("Unknown error fetching crate!");
        }

        console.log("Crate fetched: ", data);
        return data;
    }

}

export const supabase = new SupaAPI();