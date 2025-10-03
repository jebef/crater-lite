import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Artist, Crate, SupaCrate, SupaReleaseGroup, ReleaseGroup } from "../../utils/types.ts";

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

        // console.log("Search results: ", data);

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

        // console.log("Search results: ", data);

        return data.results;
    }

    async fetchMusicBrainzReleaseGroup(mbid: string): Promise<ReleaseGroup> {
        const { data, error } = await this.client.functions.invoke("fetch-release-group", {
            body: {
                mbid
            }
        });

        if (error) {
            console.error("Error fetching release group from MusicBrainz: ", error.message);
            throw error;
        }

        return data.result;
    }

    async newCrate(crate: Crate): Promise<void> {
        const supaCrate: SupaCrate = {
            key: crate.key,
            private_key: crate.privateKey,
            title: crate.title,
            to_name: crate.toName,
            from_name: crate.fromName,
            description: crate.description
        };

        const { data: crateData, error: crateError } = await this.client
            .from("crates")
            .insert([supaCrate])
            .select()
            .single();

        if (crateError || !crateData) {
            console.error("Error inserting crate: ", crateError?.message);
            throw crateError;
        }

        const crate_id = crateData.id;
        console.log("New crate added to db!", crate_id);

        if (crate.releaseGroups && crate.releaseGroups.length > 0) {
            const supaReleaseGroups: SupaReleaseGroup[] = crate.releaseGroups.map((releaseGroup, index) => ({
                crate_id,
                mbid: releaseGroup.mbid,
                index: index
            }));

            const { error: releaseGroupError } = await this.client
                .from("release_groups")
                .insert(supaReleaseGroups);

            if (releaseGroupError) {
                console.error("Error inserting release groups: ", releaseGroupError.message);
                throw releaseGroupError;
            }
        }

        // if (crate.notes && crate.notes.length > 0) {
        //     const supaNotes: SupaNote[] = crate.notes.map((note, idx) => ({
        //         crateId,
        //         content: note.content,
        //         index: idx
        //     }));

        //     const { error: notesError } = await this.client
        //         .from("notes")
        //         .insert(supaNotes);

        //     if (notesError) {
        //         console.error("Error inserting notes: ", notesError.message);
        //         throw notesError;
        //     }
        // }

        console.log("Crate fully created with release groups + notes!");
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