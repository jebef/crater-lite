/**
 * Shared configuration for Supabase Edge Functions
 */

export const MB_CONFIG = {
    USER_AGENT: "Crater/1.0 ( wjebef@berkeley.edu )",
    RATE_LIMIT_MS: 1000, // 1 request per second
    QUERY_LIMITS: {
        ARTIST: 50,
        RELEASE: 10,
    },
    REQUEST_TIMEOUT: 10000, // 10 seconds
} as const;
