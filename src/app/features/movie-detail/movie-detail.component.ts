import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../core/services/movie.service';
import { CommentService, Comment } from '../../core/services/comment.service';
import { RatingService, Rating } from '../../core/services/rating.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { UserListService } from '../../core/services/user-list.service';
import { AuthService } from '../../core/services/auth.service';
import { MovieDTO, UserList } from '../../core/models/admin.models';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-movie-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './movie-detail.component.html',
})
export class MovieDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private location = inject(Location);
    private movieService = inject(MovieService);
    private commentService = inject(CommentService);
    private ratingService = inject(RatingService);
    private favoriteService = inject(FavoriteService);
    private userListService = inject(UserListService);
    private auth = inject(AuthService);
    private cdr = inject(ChangeDetectorRef);

    readonly apiUrl = environment.apiUrl;

    // ── Movie ──────────────────────────────────────────────────────────────
    movie: MovieDTO | null = null;
    loading = true;

    // ── Favorite ───────────────────────────────────────────────────────────
    isFavorite = false;

    // ── Rating ─────────────────────────────────────────────────────────────
    ratings: Rating[] = [];
    userRating: Rating | null = null;
    hoverStar = 0;
    selectedStar = 0;
    submittingRating = false;

    // ── Comments ───────────────────────────────────────────────────────────
    comments: Comment[] = [];
    loadingComments = false;
    newCommentText = '';
    submittingComment = false;
    editingComment: Comment | null = null;
    editCommentText = '';

    // ── List modal ─────────────────────────────────────────────────────────
    userLists: UserList[] = [];
    showListModal = false;
    newListName = '';

    get isLoggedIn(): boolean { return this.auth.isLoggedIn(); }
    get currentUser() { return this.auth.getUser(); }

    goBack(): void {
        this.location.back();
    }

    get averageRating(): number {
        if (!this.ratings.length) return 0;
        const sum = this.ratings.reduce((a, r) => a + (r.rating ?? 0), 0);
        return Math.round((sum / this.ratings.length) * 10) / 10;
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const id = +params['id'];
            this.loadMovie(id);
            this.loadRatings(id);
            this.loadComments(id);
            if (this.isLoggedIn) {
                this.loadUserData(id);
            }
        });
    }

    // ── Loaders ────────────────────────────────────────────────────────────

    private loadMovie(id: number): void {
        this.movieService.getPublicOne(id).subscribe({
            next: (movie) => {
                this.movie = movie;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => { this.loading = false; this.cdr.detectChanges(); }
        });
    }

    private loadRatings(movieId: number): void {
        this.ratingService.getByMovie(movieId).subscribe({
            next: (ratings) => {
                this.ratings = ratings;
                if (this.currentUser) {
                    this.userRating = ratings.find(r => r.user?.email === this.currentUser!.email) ?? null;
                    this.selectedStar = this.userRating?.rating ?? 0;
                }
                this.cdr.detectChanges();
            }
        });
    }

    private loadComments(movieId: number): void {
        this.loadingComments = true;
        this.commentService.getByMovie(movieId).subscribe({
            next: (comments) => {
                this.comments = comments;
                this.loadingComments = false;
                this.cdr.detectChanges();
            },
            error: () => { this.loadingComments = false; this.cdr.detectChanges(); }
        });
    }

    private loadUserData(movieId: number): void {
        const userId = this.currentUser?.id;
        if (!userId) return;

        this.favoriteService.getByUser(userId).subscribe({
            next: (favorites) => {
                this.isFavorite = favorites.some(f => f.movie?.id === movieId);
                this.cdr.detectChanges();
            },
            error: () => { }
        });

        this.userListService.getListsByUser(userId).subscribe({
            next: (lists) => { this.userLists = lists; this.cdr.detectChanges(); },
            error: () => { }
        });
    }

    // ── Favorites ──────────────────────────────────────────────────────────

    toggleFavorite(): void {
        if (!this.movie || !this.currentUser?.id) return;
        const userId = this.currentUser.id;
        const movieId = this.movie.id;

        if (this.isFavorite) {
            this.isFavorite = false;
            this.cdr.detectChanges();
            this.favoriteService.remove(userId, movieId).subscribe({
                error: () => { this.isFavorite = true; this.cdr.detectChanges(); }
            });
        } else {
            this.isFavorite = true;
            this.cdr.detectChanges();
            this.favoriteService.add(userId, movieId).subscribe({
                error: () => { this.isFavorite = false; this.cdr.detectChanges(); }
            });
        }
    }

    // ── Rating ─────────────────────────────────────────────────────────────

    submitRating(star: number): void {
        if (!this.movie || !this.isLoggedIn || this.submittingRating) return;
        this.submittingRating = true;
        this.selectedStar = star;
        this.cdr.detectChanges();

        this.ratingService.upsert(this.movie.id, star).subscribe({
            next: (saved) => {
                this.userRating = saved;
                this.submittingRating = false;
                this.loadRatings(this.movie!.id);
            },
            error: () => { this.submittingRating = false; this.cdr.detectChanges(); }
        });
    }

    deleteRating(): void {
        if (!this.userRating?.id) return;
        this.ratingService.delete(this.userRating.id).subscribe({
            next: () => {
                this.userRating = null;
                this.selectedStar = 0;
                this.loadRatings(this.movie!.id);
            }
        });
    }

    // ── Comments ───────────────────────────────────────────────────────────

    submitComment(): void {
        if (!this.movie || !this.newCommentText.trim() || this.submittingComment) return;
        this.submittingComment = true;

        this.commentService.create(this.movie.id, this.newCommentText.trim()).subscribe({
            next: (created) => {
                this.comments = [created, ...this.comments];
                this.newCommentText = '';
                this.submittingComment = false;
                this.cdr.detectChanges();
            },
            error: () => { this.submittingComment = false; this.cdr.detectChanges(); }
        });
    }

    startEditComment(comment: Comment): void {
        this.editingComment = comment;
        this.editCommentText = comment.text ?? '';
    }

    cancelEditComment(): void {
        this.editingComment = null;
        this.editCommentText = '';
    }

    saveEditComment(): void {
        if (!this.editingComment?.id || !this.editCommentText.trim()) return;
        this.commentService.update(this.editingComment.id, this.editCommentText.trim()).subscribe({
            next: (updated) => {
                const idx = this.comments.findIndex(c => c.id === updated.id);
                if (idx !== -1) this.comments[idx] = updated;
                this.comments = [...this.comments];
                this.cancelEditComment();
                this.cdr.detectChanges();
            }
        });
    }

    deleteComment(commentId: number): void {
        this.commentService.delete(commentId).subscribe({
            next: () => {
                this.comments = this.comments.filter(c => c.id !== commentId);
                this.cdr.detectChanges();
            }
        });
    }

    isMyComment(comment: Comment): boolean {
        return !!this.currentUser && comment.user?.email === this.currentUser.email;
    }

    // ── Lists ──────────────────────────────────────────────────────────────

    openListModal(): void { this.showListModal = true; }

    closeListModal(): void {
        this.showListModal = false;
        this.newListName = '';
    }

    addToList(listId: number): void {
        if (!this.movie) return;
        this.userListService.addMovieToList(listId, this.movie.id).subscribe({
            next: () => this.closeListModal(),
            error: (e) => console.error('Error adding to list', e)
        });
    }

    createAndAdd(): void {
        if (!this.newListName.trim() || !this.movie || !this.currentUser) return;
        const newList: UserList = {
            title: this.newListName.trim(),
            isPublic: false,
            user: { id: this.currentUser.id, name: this.currentUser.name, email: this.currentUser.email }
        };
        this.userListService.createList(newList).subscribe({
            next: (created) => {
                this.userLists.push(created);
                this.addToList(created.id!);
            },
            error: (e) => console.error('Error creating list', e)
        });
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    getStarArray(): number[] { return [1, 2, 3, 4, 5]; }

    getImageUrl(path: string | null): string {
        if (!path) return '';
        return path.startsWith('http') ? path : this.apiUrl + path;
    }

    getInitials(title: string): string {
        return title.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    }

    formatDate(dateStr?: string): string {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    }
}
