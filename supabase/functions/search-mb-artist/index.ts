import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import type { Artist } from "../../../utils/types.ts";
import { musicBrainzRateLimiter } from "../_shared/rate-limiter.ts";
import { jsonResponse, corsPreflightResponse } from "../_shared/json-response.ts";
import { MB_CONFIG } from "../_shared/config.ts";

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return corsPreflightResponse();
    }

    try {
        const { query } = await req.json();

        if (!query || typeof query !== "string" || query.trim() === "") {
            return jsonResponse({ error: "Query parameter is required and must be a non-empty string" }, 400);
        }

        const searchUrl = `https://musicbrainz.org/ws/2/artist/?query=artist:${encodeURIComponent(query)}&fmt=json&limit=${MB_CONFIG.QUERY_LIMITS.ARTIST}`;

        // Use rate limiter to respect MusicBrainz's 1 req/sec limit
        const res = await musicBrainzRateLimiter.fetch(searchUrl, {
            headers: { "User-Agent": MB_CONFIG.USER_AGENT }
        });

        if (!res.ok) {
            if (res.status === 503) {
                return jsonResponse({
                    error: {
                        message: "MusicBrainz rate limit exceeded. Please try again in a moment.",
                        code: "RATE_LIMIT_EXCEEDED",
                        retryable: true
                    }
                }, 503);
            } else if (res.status === 404) {
                return jsonResponse({ error: "No artists found" }, 404);
            }
            throw new Error(`MusicBrainz API error: ${res.status}`);
        }

        const data = await res.json();

        if (!data.artists || data.artists.length === 0) {
            return jsonResponse({ results: [] }, 200);
        }

        const results: Artist[] = data.artists.map((artist: any) => {
            return {
                mbid: artist.id,
                name: artist.name,
                type: artist.type
            }
        });

        return jsonResponse({ results });

    } catch (err) {
        console.error("Error fetching artist:", err);
        return jsonResponse({
            error: {
                message: "Failed to search for artists. Please try again.",
                code: "SEARCH_ERROR",
                retryable: true
            }
        }, 500);
    }
});
