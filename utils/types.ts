export type Artist = {
    mbid: string;
    name: string;
    type: string;   // "Person" | "Group" | "Orchestra" | "Choir" | "Character" | "Other"
}

export type Release = {
    mbid: string;
    title: string;
    coverUrl: string | undefined;
    status: string;
    mediaType: string | undefined;
    artists: Artist[];
    date: string | undefined;
    country: string | undefined;
}

export type ReleaseGroup = {
    mbid: string;
    title: string;
    generalCoverUrl: string;
    artists: Artist[];
    releases: Release[];
}