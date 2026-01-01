/**
 * Rate limiter for API compliance
 *
 * MusicBrainz requires no more than 1 request per second on average
 * Ref: https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting
 *
 * Cover Art Archive also has rate limits to be respectful of their service
 */

export class RateLimiter {
    private lastRequestTime = 0;
    private readonly minInterval: number;

    /**
     * @param requestsPerSecond - Maximum requests per second (default: 1 for MusicBrainz)
     */
    constructor(requestsPerSecond: number = 1) {
        this.minInterval = 1000 / requestsPerSecond; // Convert to milliseconds between requests
    }

    /**
     * Throttles execution to ensure minimum time between requests
     * Call this before making any API request
     */
    async throttle(): Promise<void> {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.minInterval) {
            const waitTime = this.minInterval - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequestTime = Date.now();
    }

    /**
     * Wraps a fetch call with rate limiting
     * @param url - URL to fetch
     * @param options - Fetch options
     */
    async fetch(url: string, options?: RequestInit): Promise<Response> {
        await this.throttle();
        return fetch(url, options);
    }
}

// Singleton instance for MusicBrainz API (1 request per second)
export const musicBrainzRateLimiter = new RateLimiter(1);
