import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface SearchRequest {
    query: string;
    type?: string;
}

interface Track {
    position: number;
    title: string;
    length: number;
}

interface SearchResult {
    mbid: string;
    cover: string | null;
    title: string;
    date: string;
    country: string;
    artists: string;
    tracks: Track[];
    labels: string;
}

interface LabelInfo {
    "catalog-number": string;
    label: {
        id: string;
        name: string;
    }
}

interface Media {
    id: string;
    format: string;
    "disk-count": number;
    "track-count": number;
}

interface Release {
    id: string;
    score: string;
    count: number;
    title: string;
    "status-id": string;
    status: string;
    packaging: string;
    "text-representation": any;
    "artist-credit": ArtistCredit[];
    "artist-credit-id": string;
    "release-group": {
        id: string;
        "primary-type": string;
    };
    date: string;
    country: string;
    "release-events": any;
    barcode: any;
    "label-info": LabelInfo[];
    "track-count": number;
    media: Media[];
}

interface Artist {
    id: string;
    name: string;
    "sort-name": string;
    disambiguation: string;
    aliases: any[];
}

interface ReleaseGroup {
    id: string;
    score: string;
    count: number;
    title: string;
    "first-release-date": string;
    "primary-type": string;
    "artist-credit": Artist[];
    "artist-credit-id": string;
    releases: Release[];
}

interface ReleaseGroupSearchResponse {
    created: string;
    count: number;
    offset: number;
    "release-groups": ReleaseGroup[];
}

interface ReleaseGroupResult {
    id: string;
    title: string;
    artists: string;
    generalCoverArtUrl: string;
}

const QUERY_LIMIT = 50;
const USER_AGENT = "Crater/1.0 ( wjebef@berkeley.edu )";

// TODO: update to handle release-group data for more refined search results 
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

        // Search by Release: 
            // Use query to search for release groups whose title matches the query 
            // for each release group, capture title, cover, and artist credit 

        // Search by Artist: 
            // Use query to search for artists
                // User selects an artist: 
                    // return all release groups for the artist using the artist's mbid 
                    // for each release group, capture title, cover, and artist credit 

        const { query, type = "release" }: SearchRequest = await req.json();

        let searchUrl;

        // SEARCH FOR RELEASE-GROUPS BY ARTIST NAME 
        if (type === "artist") {
            // fetch artist MBID for non-fuzzy search 
            const artistMbid = await fetchArtistMbid(query);
            if (!artistMbid) return jsonResponse({ error: "No artists found, please try again" }, 404);

            searchUrl = `https://musicbrainz.org/ws/2/artist/${artistMbid}?inc=release-groups&fmt=json&limit=${QUERY_LIMIT}`;
        }
        // SEARCH FOR RELEASES BY NAME [DEFAULT]
        else {
            searchUrl = `https://musicbrainz.org/ws/2/release-group/?query=release:${encodeURIComponent(query)}&fmt=json&limit=${QUERY_LIMIT}`;
        }

        // fetch release group id 
        const res = await fetch(searchUrl, {
            headers: { "User-Agent": USER_AGENT }
        });

        const data = await res.json();

        if (!data["release-groups"]) {
            console.log("No release groups returned");
            return jsonResponse({ error: "No releases found, please try a different search" }, 404);
        }

        const results: ReleaseGroupResult[] = await Promise.all(
            data["release-groups"].map(async (releaseGroup: any) => {
                const releaseInfo = await fetchReleaseInfo(releaseGroup.id);

                if (!releaseInfo) {
                    return {
                        id: releaseGroup.id,
                        title: releaseGroup.title,
                        artists: "",
                        generalCoverArtUrl: null
                    };
                }

                const coverUrl = await fetchCoverArt(releaseInfo.id);

                return {
                    id: releaseGroup.id,
                    title: releaseGroup.title,
                    artists: releaseInfo.artists,
                    generalCoverArtUrl: coverUrl
                };
            })
        );


        return jsonResponse({ results });

    } catch (err: any) {
        return jsonResponse({ error: err.message }, 500);
    }
});

async function fetchArtistMbid(query: string): Promise<string | null> {
    try {
        // only querering for one artist 
        const searchUrl = `https://musicbrainz.org/ws/2/artist/?query=artist:${encodeURIComponent(query)}&fmt=json&limit=1`;
        const res = await fetch(searchUrl, {
            headers: { "User-Agent": USER_AGENT }
        });

        const data = await res.json();

        if (!data.artists[0]) {
            console.error("No artists found");
            return null;
        }

        return data.artists[0].id;

    } catch (err) {
        console.error("Error fetching artist MBID");
        return null;
    }
}

// returns the release mbid and credited artists 
async function fetchReleaseInfo(id: string): Promise<ReleaseGroupResult | null> {
    try {
        const searchUrl = `https://musicbrainz.org/ws/2/release-group/${id}?inc=releases+artist-credits&fmt=json`;
        const res = await fetch(searchUrl, {
            headers: { "User-Agent": USER_AGENT }
        });

        const data = await res.json();

        if (!data.releases || !data.releases[0]) {
            console.error("No release found, please try another search");
            return null;
        }

        const release = data.releases[0];
        const artists = release["artist-credit"]
            ?.map((ac: any) => ac.artist?.name)
            .join(", ") || "";

        return {
            id: release.id,
            artists
        };

    } catch (err) {
        console.error("Error fetching release MBID", err);
        return null;
    }
}


async function fetchCoverArt(id: string): Promise<string | null> {
    try {
        const res = await fetch(`https://coverartarchive.org/release/${id}`);
        if (res.ok) {
            const data = await res.json();
            // TODO: parse this more elegantly?
            return data.images?.find((img: any) => img.front)?.image || null;
        } else {
            return null;
        }
    } catch (err) {
        console.error("Error fetching cover art from archive");
        return null;
    }
}

function jsonResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
    });
}
