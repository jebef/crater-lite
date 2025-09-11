import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const QUERY_LIMIT = 10;
const USER_AGENT = "Crater/1.0 ( wjebef@berkeley.edu )";

import type { ReleaseGroup, Release, Artist } from "../../../utils/types.ts";

type ReleasesResponse = {
    releases: Release[];
    generalCoverUrl: string | null;
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response(null, {
             headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", // or restrict to http://localhost:5173
            "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        },
        });
    }

    try {
        // query: string -> release title 
        // type: release 

        // query: string -> artist mbid 
        // type: artist 

        const { query, type } = await req.json();

        let searchUrl;

        if (type === "artist") {
            searchUrl = `https://musicbrainz.org/ws/2/artist/${query}?inc=release-groups&fmt=json&limit=${QUERY_LIMIT}`;
        } else {
            searchUrl = `https://musicbrainz.org/ws/2/release-group/?query=release:${encodeURIComponent(query)}&fmt=json&limit=${QUERY_LIMIT}`;
        }
    
        const res = await fetch(searchUrl, {
            headers: { "User-Agent": USER_AGENT }
        });

        const data = await res.json();

        if (!data["release-groups"]) {
            console.log("No release groups returned");
            return jsonResponse({ error: "No releases found, please try a different search" }, 404);
        }

        const results: ReleaseGroup[] = await Promise.all(
            data["release-groups"].map(async (releaseGroup: any) => {
                const releaseResults: ReleasesResponse = await fetchReleases(releaseGroup.id);
                const artists: Artist[] = releaseGroup["artist-credit"]?.map((credit: any) => {
                    const artist = credit.artist;
                    return {
                        mbid: artist.id,
                        name: artist.name,
                        type: artist.type
                    }
                }) || [];

                return {
                    mbid: releaseGroup.id,
                    title: releaseGroup.title,
                    generalCoverUrl: releaseResults.generalCoverUrl,
                    artists: artists,
                    releases: releaseResults.releases
                };
            })
        );

        return jsonResponse({ results });

    } catch (err: any) {
        console.error("Error fetching release groups");
        return jsonResponse({ error: err }, 500);
    }
});

async function fetchReleases(releaseGroupId: string): Promise<ReleasesResponse|null> {
    try {
        const searchUrl = `https://musicbrainz.org/ws/2/release-group/${releaseGroupId}?inc=releases+artist-credits&fmt=json`;
        const res = await fetch(searchUrl, {
            headers: { "User-Agent": USER_AGENT }
        });

        const data = await res.json();
        console.log(data);

        if (!data.releases) {
            console.error("Failed to fetch releases");
            return null;
        }

        let generalCoverUrl: string | null = null;

        const releases: Release[] = await Promise.all( 
            data.releases.map(async (release: any) => {
                const coverUrl = await fetchCoverArt(release.id);
                if (coverUrl !== null && generalCoverUrl === null) {
                    generalCoverUrl = coverUrl;
                }
                const packaging = release.packaging ? release.packaging : null;
                const artists: Artist[] = release["artist-credit"]?.map((credit: any) => {
                    const artist = credit.artist;
                    return {
                        mbid: artist.id,
                        name: artist.name,
                        type: artist.type
                    }
                }) || [];
                const date = release.date ? release.date : null;
                const country = release.country ? release.country : null;

                return {
                    mbid: release.id,
                    title: release.title,
                    coverUrl: coverUrl,
                    status: release.status,
                    packaging: packaging,
                    artists: artists,
                    date: date,
                    country: country
                }
            })
        );

        const result: ReleasesResponse = {
            releases: releases,
            generalCoverUrl: generalCoverUrl
        }

        return result;

    } catch (err) {
        console.error("Error fetching releases: ", err);
        return null;
    }
}

async function fetchCoverArt(releaseId: string): Promise<string|null> {
    try {
        const res = await fetch(`https://coverartarchive.org/release/${releaseId}`);
        if (res.ok) {
            const data = await res.json();
            return data.images?.find((img: any) => img.front)?.image || null;
        } else {
            console.log("Release does not have cover art");
            return null;
        }
    } catch (err) {
        console.error("Error fetching cover art from archive: ", err);
        return null;
    }
}

function jsonResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", // or restrict to http://localhost:5173
            "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        },
    });
}

