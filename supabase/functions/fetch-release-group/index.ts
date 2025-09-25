import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const QUERY_LIMIT = 10;
const USER_AGENT = "Crater/1.0 ( wjebef@berkeley.edu )";

import type { ReleaseGroup, Artist, Track, Label } from "../../../utils/types.ts";

type ReleaseGroupInfo = {
    coverUrl: string;
    tracks: Track[];
    label: Label;
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
        // get release group mbid from request 
        const { mbid } = await req.json();

        // release group endpoint 
        const searchUrl = `https://musicbrainz.org/ws/2/release-group/${mbid}?&fmt=json`;
        const res = await fetch(searchUrl, {
            headers: { "User-Agent": USER_AGENT }
        });

        const releaseGroup = await res.json();

        if (!releaseGroup) {
            console.log(`No release group found, please check the mbid:\n${mbid}\n`);
            return jsonResponse({ error: `No release group found, please check the mbid:\n${mbid}\n` }, 404);
        }

        const firstReleaseYear = releaseGroup["first-release-date"]?.slice(0, 4);
        const artists: Artist[] = releaseGroup["artist-credit"]?.map((credit: any) => {
            const artist = credit.artist;
            return {
                mbid: artist.id,
                name: artist.name,
                type: artist.type
            }
        }) || [];

        const info = await fetchReleaseGroupInfo(releaseGroup.id, firstReleaseYear);

        const result: ReleaseGroup = {
            mbid: releaseGroup.id,
            title: releaseGroup.title,
            type: releaseGroup["primary-type"],
            coverUrl: info?.coverUrl,
            artists: artists,
            firstReleaseYear: firstReleaseYear,
            tracks: info?.tracks, 
            labels: info?.labels
        }

        return jsonResponse({ result });

    } catch (err: any) {
        console.error("Error fetching release groups");
        return jsonResponse({ error: err }, 500);
    }
});


async function fetchReleaseGroupInfo(releaseGroupId: string): Promise<ReleaseGroupInfo | null> {
    try {
        // get all official releases that are affiliated with this release group 
        const searchUrl = `https://musicbrainz.org/ws/2/release/?release-group=${releaseGroupId}&status=official&inc=media+artist-credits+recordings+labels&fmt=json`;
        const res = await fetch(searchUrl, {
            headers: { "User-Agent": USER_AGENT }
        });

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
                    tracks: tracks,
                    labels: labels
                }
            }
        }

        // if no cover art, fall back to first official release 
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
            tracks: tracks,
            labels: labels
        }

    } catch (err) {
        console.error("Error fetching releases: ", err);
        return null;
    }
}

async function fetchCoverArt(releaseId: string): Promise<string | null> {
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

