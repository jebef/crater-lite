# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Crater-lite is a React-based web application for creating and sharing curated music collections ("crates"). Users can search for music releases via MusicBrainz, compile them into personalized collections with notes, and share them via unique URLs.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Routing**: React Router v7
- **Backend**: Supabase (PostgreSQL database + Edge Functions)
- **External API**: MusicBrainz API (for music metadata)
- **Styling**: CSS Modules

## Development Commands

```bash
# Start development server (Vite HMR)
npm run dev

# Build for production (runs TypeScript check + Vite build)
npm run build

# Run ESLint
npm run lint

# Preview production build
npm preview
```

## Supabase Development

This project uses Supabase for backend services. Edge functions are located in `supabase/functions/`:

- `search-mb-artist` - Search MusicBrainz for artists
- `search-mb-release-groups` - Search for release groups (albums, singles, etc.)
- `fetch-release-group` - Fetch detailed release group data by MBID

All edge functions use Deno runtime and make API calls to MusicBrainz with the User-Agent header `Crater/1.0 ( wjebef@berkeley.edu )`.

**Environment Variables** (`.env`):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Architecture

### Routing Structure

- `/` - Home page (landing/overview)
- `/new-crate` - Create a new crate
- `/crate/:key` - View a specific crate by its unique key

### State Management

**CrateContext** (`src/contexts/CrateContext.tsx`):
- Central state management for crate creation/editing
- Uses React's `useReducer` for state updates
- Actions: `SET_TITLE`, `SET_TO_NAME`, `SET_FROM_NAME`, `SET_DESCRIPTION`, `ADD_RELEASE_GROUP`, `REMOVE_RELEASE_GROUP`, `ADD_NOTE`, `REMOVE_NOTE`, `RESET`
- Must wrap components with `<CrateProvider>` to use `useCrate()` hook

### Data Models

All TypeScript types are defined in `utils/types.ts` (note: this is in the root-level `utils/` directory, NOT `src/utils/`):

**Core Types**:
- `Crate` - Main crate object with metadata, release groups, and notes
- `ReleaseGroup` - Music release with MusicBrainz ID (mbid), cover art, artists, tracks
- `Artist` - Artist info from MusicBrainz
- `ReleaseNote` - User notes attached to specific releases

**Supabase Types** (database schema mapping):
- `SupaCrate` - Maps `Crate` to snake_case database columns
- `SupaReleaseGroup` - Junction table for crate-release relationships
- `SupaNote` - Notes storage (currently commented out in implementation)

### API Layer

`src/utils/supabase.ts` contains the `SupaAPI` class:
- Singleton instance exported as `supabase`
- Methods:
  - `searchMusicBrainzArtist(query)` - Search for artists
  - `searchMusicBrainzReleaseGroup(query, type)` - Search for releases
  - `fetchMusicBrainzReleaseGroup(mbid)` - Get full release details
  - `newCrate(crate)` - Insert crate + release groups into database
  - `getCrate(id, key)` - Fetch crate with optional access key validation

### Component Organization

**Pages** (`src/pages/`):
- Each page component handles routing and provides context providers
- `NewCrate.tsx` wraps `CrateEditor` with `CrateProvider`
- `Crate.tsx` handles viewing/displaying existing crates

**Components** (`src/components/`):
- Use CSS Modules for styling (`.module.css` files)
- `CrateEditor` - Main editor interface for creating crates
- `MusicBrainzSearch` - Search interface for finding releases
- `AddRelease` - Add releases to a crate
- `CrateAnimation` - Animation component (uses WebM video format)
- `ReleasePopup`, `CratePopup` - Modal dialogs for detailed views
- `Gram` - Individual release display component
- `ImageStackScroller` - Cover art visualization

**Utilities** (`src/utils/`):
- `Modal.ts` - Portal-based modal rendering helper
- `FindFontSize.tsx` - Dynamic font sizing utility

## Database Schema

**Tables**:
- `crates` - Stores crate metadata (id, key, private_key, title, to_name, from_name, description)
- `release_groups` - Junction table linking crates to MusicBrainz release groups (crate_id, mbid, index for ordering)

**Note**: The `notes` table exists in types but is currently commented out in the implementation.

## MusicBrainz Integration

- All MusicBrainz queries go through Supabase Edge Functions (not direct from client)
- MBIDs (MusicBrainz IDs) are used as unique identifiers for artists and releases
- Cover art URLs are fetched from Cover Art Archive via MusicBrainz
- Release groups include: title, type, artists, first release year, tracks, labels

## Key Patterns

1. **CSS Modules**: Import styles as `import styles from './Component.module.css'` and use as `className={styles['class-name']}`
2. **Context Usage**: Always wrap pages that need crate state with `<CrateProvider>`
3. **Type Safety**: All API responses are typed - refer to `utils/types.ts` for contracts
4. **Modal Pattern**: Use the `Modal` utility from `src/utils/Modal.ts` for portal-based popups
