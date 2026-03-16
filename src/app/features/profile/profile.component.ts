import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
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
    private get userId(): number { return this.user!.id; }

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
        this.favoriteService.getByUser(this.userId).subscribe({
            next: (favorites) => {
                if (favorites.length === 0) {
                    this.favorites = [];
                    this.loadingFavorites = false;
                    this.loading = false;
                    this.cdr.detectChanges();
                    return;
                }
                // Fetch full MovieDTO for each favorite
                const movieRequests = favorites
                    .filter(f => f.movie?.id)
                    .map(f => this.movieService.getPublicOne(f.movie!.id!));

                if (movieRequests.length === 0) {
                    this.favorites = [];
                    this.loadingFavorites = false;
                    this.loading = false;
                    this.cdr.detectChanges();
                    return;
                }

                forkJoin(movieRequests).subscribe({
                    next: (movies) => {
                        this.favorites = movies;
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
            },
            error: () => {
                this.loadingFavorites = false;
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    removeFavorite(movieId: number): void {
        this.favoriteService.remove(this.userId, movieId).subscribe({
            next: () => {
                this.favorites = this.favorites.filter(m => m.id !== movieId);
                this.cdr.detectChanges();
            },
            error: (e) => console.error('Error removing favorite', e)
        });
    }

    // ── Lists ──────────────────────────────────────────────────────────────

    private loadLists(): void {
        this.loadingLists = true;
        this.userListService.getListsByUser(this.userId).subscribe({
            next: (lists) => {
                this.userLists = lists.map(l => ({
                    id: l.id,
                    title: l.title,
                    isPublic: l.isPublic,
                    movies: [],
                }));
                this.loadingLists = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loadingLists = false;
                this.cdr.detectChanges();
            }
        });
    }

    toggleListExpand(listId: number): void {
        if (this.expandedListId === listId) {
            this.expandedListId = null;
        } else {
            this.expandedListId = listId;
            // Load movies for this list
            const list = this.userLists.find(l => l.id === listId);
            if (list && (!list.movies || list.movies.length === 0)) {
                this.userListService.getMoviesInList(listId).subscribe({
                    next: (listMovies) => {
                        if (listMovies.length === 0) return;
                        const movieRequests = listMovies
                            .filter(lm => lm.movie?.id)
                            .map(lm => this.movieService.getPublicOne(lm.movie!.id!));

                        if (movieRequests.length === 0) return;

                        forkJoin(movieRequests).subscribe({
                            next: (movies) => {
                                list.movies = movies;
                                this.cdr.detectChanges();
                            }
                        });
                    }
                });
            }
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
        const newList: UserList = {
            title: this.newListTitle.trim(),
            isPublic: this.newListPublic,
            user: { id: this.userId, name: this.user!.name, email: this.user!.email },
        };
        this.userListService.createList(newList).subscribe({
            next: (created) => {
                this.userLists = [...this.userLists, {
                    id: created.id,
                    title: created.title,
                    isPublic: created.isPublic,
                    movies: [],
                }];
                this.closeCreateListModal();
                this.cdr.detectChanges();
            },
            error: (e) => console.error('Error creating list', e)
        });
    }

    deleteList(listId: number, event: Event): void {
        event.stopPropagation();
        this.userListService.deleteList(listId).subscribe({
            next: () => {
                this.userLists = this.userLists.filter(l => l.id !== listId);
                if (this.expandedListId === listId) this.expandedListId = null;
                this.cdr.detectChanges();
            },
            error: (e) => console.error('Error deleting list', e)
        });
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
        const listId = this.addMovieTargetListId;
        this.userListService.addMovieToList(listId, movie.id).subscribe({
            next: () => {
                const list = this.userLists.find(l => l.id === listId);
                if (list) {
                    if (!list.movies) list.movies = [];
                    if (!list.movies.find(m => m.id === movie.id)) {
                        list.movies = [...list.movies, movie];
                    }
                }
                this.closeAddMovieModal();
                this.cdr.detectChanges();
            },
            error: (e) => console.error('Error adding movie to list', e)
        });
    }

    removeMovieFromList(listId: number, movieId: number): void {
        this.userListService.removeMovieFromList(listId, movieId).subscribe({
            next: () => {
                const list = this.userLists.find(l => l.id === listId);
                if (list && list.movies) {
                    list.movies = list.movies.filter(m => m.id !== movieId);
                }
                this.cdr.detectChanges();
            },
            error: (e) => console.error('Error removing movie from list', e)
        });
    }

    // ── Recommendations ────────────────────────────────────────────────────

    private loadRecommendations(): void {
        this.loadingRecommendations = true;
        // TODO: replace with real recommendation endpoint when available
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
