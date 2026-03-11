import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../../../core/services/movie.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Movie, Category } from '../../../../core/models/admin.models';

@Component({
    selector: 'app-movies',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './movies.component.html',
})
export class MoviesComponent implements OnInit {
    movieSvc = inject(MovieService);
    private catSvc = inject(CategoryService);

    movies = signal<Movie[]>([]);
    categories = signal<Category[]>([]);
    loading = signal(false);
    error = signal('');
    successMsg = signal('');

    // Form state
    showForm = false;
    editingId: number | null = null;
    form: Movie = this.emptyForm();
    selectedCategoryId: number | null = null;
    selectedImage: File | null = null;
    imagePreview: string | null = null;
    saving = false;

    // Delete confirm
    deletingId: number | null = null;

    ngOnInit(): void {
        this.load();
        this.catSvc.getAll().subscribe({ next: (c) => this.categories.set(c) });
    }

    load(): void {
        this.loading.set(true);
        this.error.set('');
        this.movieSvc.getAll().subscribe({
            next: (data) => { this.movies.set(data); this.loading.set(false); },
            error: () => { this.error.set('Erreur lors du chargement des films.'); this.loading.set(false); },
        });
    }

    openAdd(): void {
        this.editingId = null;
        this.form = this.emptyForm();
        this.selectedCategoryId = null;
        this.selectedImage = null;
        this.imagePreview = null;
        this.showForm = true;
    }

    openEdit(movie: Movie): void {
        this.editingId = movie.id ?? null;
        this.form = {
            title: movie.title,
            synopsis: movie.synopsis ?? '',
            releaseYear: movie.releaseYear,
            director: movie.director ?? '',
            actors: movie.actors ?? '',
            popularityScore: movie.popularityScore,
            rating: movie.rating,
        };
        this.selectedCategoryId = movie.category?.id ?? null;
        this.selectedImage = null;
        this.imagePreview = movie.imagePath ? `${this.movieSvc.apiUrl}${movie.imagePath}` : null;
        this.showForm = true;
    }

    closeForm(): void {
        this.showForm = false;
    }

    onFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.selectedImage = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => this.imagePreview = e.target?.result as string;
            reader.readAsDataURL(this.selectedImage);
        }
    }

    save(): void {
        if (!this.form.title?.trim()) return;
        if (!this.editingId && !this.selectedImage) {
            this.error.set('Une image est requise pour créer un film.');
            return;
        }

        const payload: Movie = {
            ...this.form,
            category: this.selectedCategoryId
                ? this.categories().find(c => c.id === Number(this.selectedCategoryId)) ?? undefined
                : undefined,
        };

        this.saving = true;
        this.error.set('');

        const obs = this.editingId
            ? (this.selectedImage
                ? this.movieSvc.update(this.editingId, payload, this.selectedImage)
                : this.movieSvc.update(this.editingId, payload))
            : this.movieSvc.create(payload, this.selectedImage!);

        obs.subscribe({
            next: () => {
                this.saving = false;
                this.showForm = false;
                this.showSuccess(this.editingId ? 'Film mis à jour.' : 'Film créé.');
                this.load();
            },
            error: () => {
                this.saving = false;
                this.error.set('Erreur lors de la sauvegarde.');
            },
        });
    }

    confirmDelete(id: number): void { this.deletingId = id; }
    cancelDelete(): void { this.deletingId = null; }

    doDelete(): void {
        if (this.deletingId === null) return;
        this.movieSvc.delete(this.deletingId).subscribe({
            next: () => { this.deletingId = null; this.showSuccess('Film supprimé.'); this.load(); },
            error: () => { this.error.set('Erreur lors de la suppression.'); this.deletingId = null; },
        });
    }

    private emptyForm(): Movie {
        return { title: '', synopsis: '', releaseYear: undefined, director: '', actors: '', popularityScore: undefined };
    }

    private showSuccess(msg: string): void {
        this.successMsg.set(msg);
        setTimeout(() => this.successMsg.set(''), 3000);
    }
}
