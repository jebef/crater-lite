import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import type { ReleaseGroup, Artist, Track, Label } from "../../../utils/types.ts";
import { musicBrainzRateLimiter } from "../_shared/rate-limiter.ts";
import { jsonResponse, corsPreflightResponse } from "../_shared/json-response.ts";
import { MB_CONFIG } from "../_shared/config.ts";
import { fetchCoverArt } from "../_shared/cover-art.ts";

type ReleaseGroupInfo = {
    coverUrl?: string;
    artists: Artist[];
    tracks: Track[];
    labels: Label[];
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return corsPreflightResponse();
    }

    try {
        const { mbid } = await req.json();

        if (!mbid || typeof mbid !== "string" || mbid.trim() === "") {
            return jsonResponse({ error: "MBID parameter is required and must be a non-empty string" }, 400);
        }

        // Release group endpoint
        const searchUrl = `https://musicbrainz.org/ws/2/release-group/${mbid}?&fmt=json`;

        // Use rate limiter for initial request
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
                return jsonResponse({ error: `No release group found with MBID: ${mbid}` }, 404);
            }
            throw new Error(`MusicBrainz API error: ${res.status}`);
        }

        const releaseGroup = await res.json();

        if (!releaseGroup || !releaseGroup.id) {
            console.log(`No release group found, please check the mbid: ${mbid}`);
            return jsonResponse({ error: `No release group found with MBID: ${mbid}` }, 404);
        }

        const firstReleaseYear = releaseGroup["first-release-date"]?.slice(0, 4);

        // Rate limiter is called inside fetchReleaseGroupInfo
        const info = await fetchReleaseGroupInfo(releaseGroup.id);

        const result: ReleaseGroup = {
            mbid: releaseGroup.id,
            title: releaseGroup.title,
            type: releaseGroup["primary-type"] || "Album",
            coverUrl: info?.coverUrl || "",
            artists: info?.artists || [],
            firstReleaseYear: firstReleaseYear || "",
            tracks: info?.tracks || [],
            labels: info?.labels || []
        }

        return jsonResponse({ result });

    } catch (err: any) {
        console.error("Error fetching release group:", err);
        return jsonResponse({
            error: {
                message: "Failed to fetch release group. Please try again.",
                code: "FETCH_ERROR",
                retryable: true
            }
        }, 500);
    }
});


async function fetchReleaseGroupInfo(releaseGroupId: string): Promise<ReleaseGroupInfo | null> {
    try {
        // Get all official releases that are affiliated with this release group
        const searchUrl = `https://musicbrainz.org/ws/2/release/?release-group=${releaseGroupId}&status=official&inc=media+artist-credits+recordings+labels&fmt=json`;

        // Use rate limiter for release info fetch
        const res = await musicBrainzRateLimiter.fetch(searchUrl, {
            headers: { "User-Agent": MB_CONFIG.USER_AGENT }
        });

        if (!res.ok) {
            console.error(`Failed to fetch release group info: ${res.status}`);
            return null;
        }

        const data = await res.json();

        if (!data.releases) {
            console.error("Failed to fetch releases!");
            return null;
        }

        // sort by release date 
        const sorted = data.releases.sort((a: any, b: any) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        // find earliest offical release with cover art 
        for (const release of sorted) {
            if (release["cover-art-archive"]?.artwork === true &&
                release["cover-art-archive"]?.front === true
            ) {
                const coverUrl = await fetchCoverArt(release.id);
                const artists: Artist[] = release["artist-credit"]?.map((credit: any) => {
                    const artist = credit.artist;
                    return {
                        mbid: artist.id,
                        name: artist.name,
                        type: artist.type
                    }
                }) || [];
                const tracks: Track[] = release.media?.flatMap((m: any) =>
                    m.tracks?.map((track: any) => ({
                        mbid: track.id,
                        number: track.number,
                        title: track.title,
                        length: track.length
                    })) || []
                ) || [];
                const labels: Label[] = release["label-info"]?.map((info: any) => {
                    return {
                        mbid: info.label?.id,
                        name: info.label?.name
                    }
                });

                return {
                    coverUrl: coverUrl,
                    artists: artists,
                    tracks: tracks,
                    labels: labels
                }
            }
        }

        // if no cover art, fall back to first official release 
        const artists: Artist[] = sorted[0]["artist-credit"]?.map((credit: any) => {
            const artist = credit.artist;
            return {
                mbid: artist.id,
                name: artist.name,
                type: artist.type
            }
        }) || [];

        const tracks: Track[] = sorted[0].media?.flatMap((m: any) =>
            m.tracks?.map((track: any) => ({
                mbid: track.id,
                number: track.number,
                title: track.title,
                length: track.length
            })) || []
        ) || [];

        const labels: Label[] = sorted[0]["label-info"]?.map((info: any) => {
            return {
                mbid: info.label?.id,
                name: info.label?.name
            }
        });

        return {
            coverUrl: undefined,
            artists: artists,
            tracks: tracks,
            labels: labels
        }

    } catch (err) {
        console.error("Error fetching releases: ", err);
        return null;
    }
}


