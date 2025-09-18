export type Artist = {
    mbid: string;
    name: string;
    type: string;   // "Person" | "Group" | "Orchestra" | "Choir" | "Character" | "Other"
}

export type Track = {
    mbid: string;
    "number": number;
    title: string;
    length: number;
}

export type Label = {
    mbid: string;
    name: string;
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

export type NormalizedReleaseGroup = {
    mbid: string;
    title: string;
    type: string;
    coverUrl: string;
    artists: Artist[];
    firstReleaseYear: string;
    tracks: Track[];
    labels: Label[];
}

export interface ReleasePopupProps {
    data: NormalizedReleaseGroup;
    onAddClick: () => void;
    onNoteClick: () => void;
    onClose: () => void;
}