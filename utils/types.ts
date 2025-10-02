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

export interface ReleasePopupProps {
    data: ReleaseGroup;
    onClose: () => void;
}

export type SupaReleaseGroup = {
    id?: number;
    crate_id: number;
    mbid: string;
    index: number;
}

export type SupaNote = {
    id?: number;
    crate_id: number;
    content: string;
    index: number;
}

export type SupaCrate = {
    id?: number;
    key: string;
    private_key?: string;
    title: string;
    to_name: string;
    from_name: string;
    description: string;
}

export type ReleaseGroup = {
    mbid: string;
    title: string;
    type: string;
    coverUrl: string;
    artists: Artist[];
    firstReleaseYear: string;
    tracks: Track[];
    labels: Label[];
}

export type ReleaseNote = {
    mbid: string;
    content: string;
}

export type Crate = {
    id?: number;
    key: string;
    privateKey?: string;
    title: string;
    toName: string;
    fromName: string;
    description: string;
    releaseGroups: ReleaseGroup[];
    notes: ReleaseNote[];
}