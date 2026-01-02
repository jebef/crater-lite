export async function fetchCoverArt(releaseId: string): Promise<string | undefined> {
    try {
        console.log(`Fetching cover art for release: ${releaseId}`);

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
        const imageUrl = data.images?.find((img: any) => img.front)?.image;

        // Upgrade HTTP to HTTPS to prevent mixed content warnings
        return imageUrl ? imageUrl.replace('http://', 'https://') : undefined;

    } catch (err) {
        console.error(`Error fetching cover art for release ${releaseId}:`, err);
        return undefined;
    }
}
