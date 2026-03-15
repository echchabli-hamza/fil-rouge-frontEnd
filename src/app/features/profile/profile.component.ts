import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { UserListService } from '../../core/services/user-list.service';
import { MovieService } from '../../core/services/movie.service';
import { MovieDTO, Favorite, UserList } from '../../core/models/admin.models';
import { environment } from '../../../environments/environment';

/** Profile-local list type with full movie DTOs instead of ListMovie refs */
interface ProfileList {
    id?: number;
    title: string;
    isPublic?: boolean;
    movies?: MovieDTO[];
}

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
    private auth = inject(AuthService);
    private favoriteService = inject(FavoriteService);
    private userListService = inject(UserListService);
    private movieService = inject(MovieService);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    readonly apiUrl = environment.apiUrl;

    // ── State ──────────────────────────────────────────────────────────────
    activeTab: 'favorites' | 'lists' | 'recommendations' = 'favorites';
    loading = true;

    // User info
    get user() { return this.auth.getUser(); }

    // Favorites
    favorites: MovieDTO[] = [];
    loadingFavorites = true;

    // Lists
    userLists: ProfileList[] = [];
    loadingLists = true;
    showCreateListModal = false;
    newListTitle = '';
    newListPublic = false;
    expandedListId: number | null = null;

    // Add-to-list modal
    showAddMovieModal = false;
    addMovieTargetListId: number | null = null;
    movieSearchQuery = '';
    movieSearchResults: MovieDTO[] = [];
    searchingMovies = false;

    // Recommendations
    recommendations: MovieDTO[] = [];
    loadingRecommendations = true;

    ngOnInit(): void {
        this.loadFavorites();
        this.loadLists();
        this.loadRecommendations();
    }

    switchTab(tab: 'favorites' | 'lists' | 'recommendations'): void {
        this.activeTab = tab;
    }

    // ── Favorites ──────────────────────────────────────────────────────────

    private loadFavorites(): void {
        this.loadingFavorites = true;
        // TODO: replace with real endpoint when ready
        // Placeholder: use trending movies as fake favorites
        this.movieService.getTrending().subscribe({
            next: (movies) => {
                this.favorites = movies.slice(0, 6);
                this.loadingFavorites = false;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loadingFavorites = false;
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    removeFavorite(movieId: number): void {
        // TODO: call favoriteService.remove() with real userId
        this.favorites = this.favorites.filter(m => m.id !== movieId);
        this.cdr.detectChanges();
    }

    // ── Lists ──────────────────────────────────────────────────────────────

    private loadLists(): void {
        this.loadingLists = true;
        // TODO: replace with real endpoint
        // Placeholder: fake lists
        this.userLists = [
            {
                id: 1,
                title: 'À regarder ce week-end',
                isPublic: false,
                movies: [],
            },
            {
                id: 2,
                title: 'Films cultes',
                isPublic: true,
                movies: [],
            },
        ];
        this.loadingLists = false;
        this.cdr.detectChanges();
    }

    toggleListExpand(listId: number): void {
        if (this.expandedListId === listId) {
            this.expandedListId = null;
        } else {
            this.expandedListId = listId;
            // TODO: load movies for this list via userListService.getMoviesInList(listId)
        }
    }

    openCreateListModal(): void {
        this.showCreateListModal = true;
        this.newListTitle = '';
        this.newListPublic = false;
    }

    closeCreateListModal(): void {
        this.showCreateListModal = false;
    }

    createList(): void {
        if (!this.newListTitle.trim()) return;
        // TODO: call userListService.createList()
        const newList: ProfileList = {
            id: Date.now(), // placeholder id
            title: this.newListTitle.trim(),
            isPublic: this.newListPublic,
            movies: [],
        };
        this.userLists = [...this.userLists, newList];
        this.closeCreateListModal();
        this.cdr.detectChanges();
    }

    deleteList(listId: number, event: Event): void {
        event.stopPropagation();
        // TODO: call userListService.deleteList()
        this.userLists = this.userLists.filter(l => l.id !== listId);
        if (this.expandedListId === listId) this.expandedListId = null;
        this.cdr.detectChanges();
    }

    // Add movie to list
    openAddMovieModal(listId: number, event: Event): void {
        event.stopPropagation();
        this.addMovieTargetListId = listId;
        this.showAddMovieModal = true;
        this.movieSearchQuery = '';
        this.movieSearchResults = [];
    }

    closeAddMovieModal(): void {
        this.showAddMovieModal = false;
        this.addMovieTargetListId = null;
    }

    searchMovies(): void {
        if (this.movieSearchQuery.trim().length < 2) return;
        this.searchingMovies = true;
        this.movieService.search(this.movieSearchQuery.trim()).subscribe({
            next: (results) => {
                this.movieSearchResults = results.slice(0, 8);
                this.searchingMovies = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.searchingMovies = false;
                this.cdr.detectChanges();
            }
        });
    }

    addMovieToList(movie: MovieDTO): void {
        if (!this.addMovieTargetListId) return;
        // TODO: call userListService.addMovieToList()
        const list = this.userLists.find(l => l.id === this.addMovieTargetListId);
        if (list) {
            if (!list.movies) list.movies = [];
            if (!list.movies.find(m => m.id === movie.id)) {
                list.movies = [...list.movies, movie];
            }
        }
        this.closeAddMovieModal();
        this.cdr.detectChanges();
    }

    removeMovieFromList(listId: number, movieId: number): void {
        // TODO: call userListService.removeMovieFromList()
        const list = this.userLists.find(l => l.id === listId);
        if (list && list.movies) {
            list.movies = list.movies.filter(m => m.id !== movieId);
        }
        this.cdr.detectChanges();
    }

    // ── Recommendations ────────────────────────────────────────────────────

    private loadRecommendations(): void {
        this.loadingRecommendations = true;
        // TODO: replace with real recommendation endpoint
        this.movieService.getTopRated().subscribe({
            next: (movies) => {
                this.recommendations = movies.slice(0, 10);
                this.loadingRecommendations = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loadingRecommendations = false;
                this.cdr.detectChanges();
            }
        });
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    goToMovie(id: number): void {
        this.router.navigate(['/movie', id]);
    }

    getImageUrl(path: string | null): string {
        if (!path) return '';
        return path.startsWith('http') ? path : this.apiUrl + path;
    }

    getInitials(title: string): string {
        return title.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    }
}
