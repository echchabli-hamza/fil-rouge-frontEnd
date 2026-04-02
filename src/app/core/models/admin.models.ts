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
    trailerUrl?: string;
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
    imagePath: string;
    trailerUrl?: string;
    rating: number;
    categoryId: number;
    categoryName: string;
    reviewCount: number;
    favoriteCount: number;
}

/** Review entity from backend */
export interface Review {
    id?: number;
    rating: number;
    comment?: string;
    createdAt?: string;
    user?: { id: number; name: string; email: string };
    movie?: { id: number; title: string };
}

/** Favorite entity from backend */
export interface Favorite {
    id?: number;
    user?: { id: number; name: string; email: string };
    movie?: { id: number; title: string };
    createdAt?: string;
}

/** UserList entity from backend */
export interface UserList {
    id?: number;
    title: string;
    isPublic?: boolean;
    user?: { id: number; name: string; email: string };
    movies?: ListMovie[];
}

/** ListMovie entity from backend */
export interface ListMovie {
    id?: number;
    addedAt?: string;
    list?: { id: number; title: string };
    movie?: { id: number; title: string };
}
