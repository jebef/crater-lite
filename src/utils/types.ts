


















// export type Crate  = {
//     id: string
//     key?: string
//     title: string
//     from: string
//     to: string
//     description: string
//     releases: Release[]
//     notes: string[]
// }

// export type Release = {
//     title: string
//     artists: string[]
//     date: string
//     tracks: Track[]
// }

// export type Track = {
//     index: number
//     side?: string
//     name: string
// }

export type Crate = {
    id: number
    key?: string | null
    title: string
    from: string
    to: string
    description: string
    mbids: string[]
    notes?: string[] | null
}

export type ArtistAlias = {
    name: string;
    "sort-name": string;
    type?: string;
    "begin-date"?: string;
    "end-date"?: string;
};

export type Artist = {
    id: string;
    name: string;
    "sort-name": string;
    aliases?: ArtistAlias[];
};

export type ArtistCredit = {
    artist: Artist;
};

export type LabelInfo = {
    "catalog-number": string;
    label: {
        id: string;
        name: string;
    };
};

export type Media = {
    id: string;
    format: string;
    "disc-count": number;
    "track-count": number;
    tracks?: Track[];
};

// export type Track = {
//     id: string;
//     title: string;
//     length?: number;
// };

// export type Release = {
//   id: string;
//   title: string;
//   status: string;
//   date?: string;
//   artists: string[]; // flattened names
//   label?: string;
//   media: Media[];
//   barcode?: string;
// };



export type Release = {
    artist: string
    country: string
    coverArtUrl: string
    date: string
    id: string
    label: string
    title: string
    tracks: Track[] | null
}

export type ReleaseSearchResponse = {
    created: string;
    count: number;
    offset: number;
    releases: any[];    // raw musicbrainz release search data 
};


export interface Track {
    position: number;
    title: string;
    length: number;
}

export interface SearchResult {
    mbid: string;
    cover: string | null;
    title: string;
    date: string;
    country: string;
    artists: string;
    tracks: Track[];
    labels: string;
}


// NEW 

export interface ReleaseGroupResult {
    id: string;
    title: string;
    artists: string;
    generalCoverArtUrl: string;
}

