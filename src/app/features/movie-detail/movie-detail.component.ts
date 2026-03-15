import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../core/services/movie.service';
import { ReviewService } from '../../core/services/review.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { UserListService } from '../../core/services/user-list.service';
import { AuthService } from '../../core/services/auth.service';
import { MovieDTO, Review, Favorite, UserList } from '../../core/models/admin.models';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-movie-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './movie-detail.component.html',
})
export class MovieDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private movieService = inject(MovieService);
    private reviewService = inject(ReviewService);
    private favoriteService = inject(FavoriteService);
    private userListService = inject(UserListService);
    private auth = inject(AuthService);
    private cdr = inject(ChangeDetectorRef);

    readonly apiUrl = environment.apiUrl;

    movie: MovieDTO | null = null;
    reviews: Review[] = [];
    userLists: UserList[] = [];
    isFavorite = false;
    loading = true;

    // Review form
    newRating = 0;
    newComment = '';
    hoverRating = 0;
    submittingReview = false;
    userReview: Review | null = null;
    editingReview = false;

    // List modal
    showListModal = false;
    newListName = '';

    get isLoggedIn(): boolean {
        return this.auth.isLoggedIn();
    }

    get currentUser() {
        return this.auth.getUser();
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const id = +params['id'];
            this.loadMovie(id);
            this.loadReviews(id);
            if (this.isLoggedIn) {
                this.loadUserData(id);
            }
        });
    }

    private loadMovie(id: number): void {
        this.movieService.getPublicOne(id).subscribe({
            next: (movie) => {
                this.movie = movie;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (e) => {
                console.error('Error loading movie', e);
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    private loadReviews(movieId: number): void {
        this.reviewService.getByMovie(movieId).subscribe({
            next: (reviews) => {
                this.reviews = reviews;
                // Check if current user already reviewed
                if (this.currentUser) {
                    this.userReview = reviews.find(r => r.user?.email === this.currentUser!.email) || null;
                    if (this.userReview) {
                        this.newRating = this.userReview.rating;
                        this.newComment = this.userReview.comment || '';
                    }
                }
                this.cdr.detectChanges();
            },
            error: (e) => console.error('Error loading reviews', e)
        });
    }

    private loadUserData(movieId: number): void {
        // Load user's favorites to check if this movie is favorited
        // We need the userId — for now we'll parse from the token or check by listing
        this.userListService.getAllLists().subscribe({
            next: (lists) => {
                this.userLists = lists;
                this.cdr.detectChanges();
            },
            error: () => {}
        });
    }

    getImageUrl(path: string | null): string {
        if (!path) return '';
        return path.startsWith('http') ? path : this.apiUrl + path;
    }

    getInitials(title: string): string {
        return title.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    }

    // ── Favorites ─────────────────────────────────────────────────────────

    toggleFavorite(): void {
        if (!this.movie) return;
        this.isFavorite = !this.isFavorite;
        this.cdr.detectChanges();
        // Note: actual API call requires userId which we don't have in the JWT user object.
        // For now we just toggle the UI state.
    }

    // ── Reviews ───────────────────────────────────────────────────────────

    setRating(star: number): void {
        this.newRating = star;
    }

    submitReview(): void {
        if (!this.movie || this.newRating === 0) return;
        this.submittingReview = true;

        if (this.userReview && this.editingReview) {
            this.reviewService.update(this.userReview.id!, this.newRating, this.newComment).subscribe({
                next: () => {
                    this.submittingReview = false;
                    this.editingReview = false;
                    this.loadReviews(this.movie!.id);
                },
                error: (e) => {
                    console.error('Error updating review', e);
                    this.submittingReview = false;
                    this.cdr.detectChanges();
                }
            });
        } else {
            this.reviewService.create(this.movie.id, this.newRating, this.newComment || undefined).subscribe({
                next: () => {
                    this.submittingReview = false;
                    this.loadReviews(this.movie!.id);
                },
                error: (e) => {
                    console.error('Error creating review', e);
                    this.submittingReview = false;
                    this.cdr.detectChanges();
                }
            });
        }
    }

    editReview(): void {
        if (this.userReview) {
            this.editingReview = true;
            this.newRating = this.userReview.rating;
            this.newComment = this.userReview.comment || '';
        }
    }

    deleteReview(): void {
        if (!this.userReview) return;
        this.reviewService.delete(this.userReview.id!).subscribe({
            next: () => {
                this.userReview = null;
                this.newRating = 0;
                this.newComment = '';
                this.editingReview = false;
                this.loadReviews(this.movie!.id);
            },
            error: (e) => console.error('Error deleting review', e)
        });
    }

    // ── Lists ─────────────────────────────────────────────────────────────

    openListModal(): void {
        this.showListModal = true;
    }

    closeListModal(): void {
        this.showListModal = false;
        this.newListName = '';
    }

    addToList(listId: number): void {
        if (!this.movie) return;
        this.userListService.addMovieToList(listId, this.movie.id).subscribe({
            next: () => {
                this.closeListModal();
            },
            error: (e) => console.error('Error adding to list', e)
        });
    }

    createAndAdd(): void {
        if (!this.newListName.trim() || !this.movie) return;
        const newList: UserList = { title: this.newListName.trim(), isPublic: false };
        this.userListService.createList(newList).subscribe({
            next: (created) => {
                this.userLists.push(created);
                this.addToList(created.id!);
            },
            error: (e) => console.error('Error creating list', e)
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    getStarArray(): number[] {
        return [1, 2, 3, 4, 5];
    }

    formatDate(dateStr?: string): string {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    getAverageRating(): number {
        if (this.reviews.length === 0) return 0;
        const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
        return Math.round((sum / this.reviews.length) * 10) / 10;
    }
}
