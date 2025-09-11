import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import type { Artist } from "../../../utils/types.ts";

const QUERY_LIMIT = 50;
const USER_AGENT = "Crater/1.0 ( wjebef@berkeley.edu )";

interface ArtistSearchResult {
    id: string;
    name: string;
    country: string;
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
                "Access-Control-Allow-Headers": "authorization,apikey,x-client-info,content-type",
            },
        });
    }

    try {
        // Search by Artist: 
            // Use query to search for artists
                // User selects an artist: 
                    // return all release groups for the artist using the artist's mbid 
                    // for each release group, capture title, cover, and artist credit 

        const { query } = await req.json();

        const searchUrl = `https://musicbrainz.org/ws/2/artist/?query=artist:${encodeURIComponent(query)}&fmt=json&limit=${QUERY_LIMIT}`;
        const res = await fetch(searchUrl, {
            headers: { "User-Agent": USER_AGENT }
        });

        const data = await res.json();

        if (!data.artists) {
            console.error("No artists found");
            return new jsonResponse({ error: "No artists found" }, 404);
        }

        const results: Artist[] = data.artists.map((artist: any) => {
            return {
                mbid: artist.id,
                name: artist.name,
                type: artist.type
            }
        });

        return new jsonResponse({ results });

    } catch (err) {
        console.error("Error fetching artist MBID");
        return null;
    }
});

function jsonResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
    });
}
