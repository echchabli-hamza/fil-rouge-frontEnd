export interface Category {
    id?: number;
    name: string;
    imagePath?: string;
    /** Emoji icon supplied by the backend (e.g. 💥). Optional — the frontend has a fallback map. */
    icon?: string;
}

export interface Movie {
    id?: number;
    title: string;
    synopsis?: string;
    releaseYear?: number;
    director?: string;
    actors?: string;
    popularityScore?: number;
    imagePath?: string;
    rating?: number;
    category?: Category;
    categoryName?: string;
}

/** Matches the backend MovieDTO returned by public endpoints */
export interface MovieDTO {
    id: number;
    title: string;
    synopsis: string;
    releaseYear: number;
    director: string;
    actors: string;
    popularityScore: number;
    /** Legacy single-image field — kept for backward compat */
    imagePath: string;
    /** Poster image URL (card thumbnails). Falls back to imagePath when empty. */
    poster: string;
    /** Backdrop / banner image URL (hero carousel). Falls back to imagePath when empty. */
    backdrop: string;
    rating: number;
    categoryId: number;
    categoryName: string;
    reviewCount: number;
    favoriteCount: number;
}
