export type Artist = {
    mbid: string;
    name: string;
    type: string;   // "Person" | "Group" | "Orchestra" | "Choir" | "Character" | "Other"
}

export type Release = {
    mbid: string;
    title: string;
    coverUrl: string | null;
    status: string;
    packaging: string | null;
    artists: Artist[];
    date: string | null;
    country: string | null;
}

export type ReleaseGroup = {
    mbid: string;
    title: string;
    generalCoverUrl: string;
    artists: Artist[];
    releases: Release[];
}