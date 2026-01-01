import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import type { ReleaseGroup, Artist, Track, Label } from "../../../utils/types.ts";
import { musicBrainzRateLimiter } from "../_shared/rate-limiter.ts";
import { jsonResponse, corsPreflightResponse } from "../_shared/json-response.ts";
import { MB_CONFIG } from "../_shared/config.ts";

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
        const { query, type } = await req.json();

        if (!query || typeof query !== "string" || query.trim() === "") {
            return jsonResponse({ error: "Query parameter is required and must be a non-empty string" }, 400);
        }

        let searchUrl: string;

        if (type === "artist") {
            // fetching versus searching, Music Brainz automatically returns all releases for this artist
            searchUrl = `https://musicbrainz.org/ws/2/artist/${query}?inc=release-groups&fmt=json`;
        } else {
            searchUrl = `https://musicbrainz.org/ws/2/release-group/?query=release:${encodeURIComponent(query)}&fmt=json&limit=${MB_CONFIG.QUERY_LIMITS.RELEASE}`;
        }

        // initial search 
        const res = await musicBrainzRateLimiter.fetch(searchUrl, {
            headers: { "User-Agent": MB_CONFIG.USER_AGENT }
        });

        // error handling 
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
                return jsonResponse({ error: "No releases found, please try a different search" }, 404);
            }
            throw new Error(`MusicBrainz API error: ${res.status}`);
        }

        // capture data from response 
        const data = await res.json();

        // extra guard for empty response 
        if (!data["release-groups"] || data["release-groups"].length === 0) {
            return jsonResponse({ results: [] }, 200);
        }

        // query for additional metadata
        // process requests sequentially to avoid violating rate limits
        const results: ReleaseGroup[] = [];
        for (const releaseGroup of data["release-groups"]) {
            const firstReleaseYear = releaseGroup["first-release-date"]?.slice(0, 4);

            const info = await fetchReleaseGroupInfo(releaseGroup.id);

            results.push({
                mbid: releaseGroup.id,
                title: releaseGroup.title,
                type: releaseGroup["primary-type"] || "Album",
                coverUrl: info?.coverUrl || "",
                artists: info?.artists || [],
                firstReleaseYear: firstReleaseYear || "",
                tracks: info?.tracks || [],
                labels: info?.labels || []
            });
        }

        return jsonResponse({ results });

    } catch (err: any) {
        console.error("Error fetching release groups:", err);
        return jsonResponse({
            error: {
                message: "Failed to fetch release groups. Please try again.",
                code: "SEARCH_ERROR",
                retryable: true
            }
        }, 500);
    }
});

async function fetchReleaseGroupInfo(releaseGroupId: string): Promise<ReleaseGroupInfo | null> {
    try {
        const searchUrl = `https://musicbrainz.org/ws/2/release/?release-group=${releaseGroupId}&status=official&inc=media+artist-credits+recordings+labels&fmt=json`;

        const res = await musicBrainzRateLimiter.fetch(searchUrl, {
            headers: { "User-Agent": MB_CONFIG.USER_AGENT }
        });

        if (!res.ok) {
            console.error(`Failed to fetch release group info: ${res.status}`);
            return null;
        }

        const data = await res.json();
        console.log(data);

        if (!data.releases) {
            console.error("Failed to fetch releases");
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

async function fetchCoverArt(releaseId: string): Promise<string | undefined> {
    try {
        console.log(`Fetching cover art for release: ${releaseId}`);

        // cover art archive does not impose rate limits 
        const coverArtUrl = `https://coverartarchive.org/release/${releaseId}`;
        const res = await fetch(coverArtUrl);

        if (!res.ok) {
            if (res.status === 404) {
                console.log(`No cover art available for release ${releaseId} (404)`);
            } else {
                console.warn(`Cover Art Archive returned status ${res.status} for release ${releaseId}`);
            }
            return undefined;
        }

        const data = await res.json();

        return data.images?.find((img: any) => img.front)?.image || undefined;

        // if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
        //     console.log(`No images in Cover Art Archive response for release ${releaseId}`);
        //     return undefined;
        // }

        // // Find the front cover image
        // const frontImage = data.images.find((img: any) => img.front === true);

        // if (frontImage && frontImage.image) {
        //     console.log(`Successfully fetched cover art for release ${releaseId}: ${frontImage.image}`);
        //     return frontImage.image;
        // }

        // // Fallback to first image if no front image marked
        // if (data.images[0]?.image) {
        //     console.log(`Using first image as fallback for release ${releaseId}: ${data.images[0].image}`);
        //     return data.images[0].image;
        // }

        // console.log(`No usable cover art found for release ${releaseId}`);
        // return undefined;

    } catch (err) {
        console.error(`Error fetching cover art for release ${releaseId}:`, err);
        return undefined;
    }
}

