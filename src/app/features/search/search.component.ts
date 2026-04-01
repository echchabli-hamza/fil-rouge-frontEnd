import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MovieService } from '../../core/services/movie.service';
import { CategoryService } from '../../core/services/category.service';
import { MovieDTO, Category } from '../../core/models/admin.models';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit {
    private movieService = inject(MovieService);
    private categoryService = inject(CategoryService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private cdr = inject(ChangeDetectorRef);

    readonly apiUrl = environment.apiUrl;

    // ── Data ──────────────────────────────────────────────────────────────
    allMovies: MovieDTO[] = [];
    filteredMovies: MovieDTO[] = [];
    categories: Category[] = [];
    directors: string[] = [];
    years: number[] = [];

    // ── Filters ───────────────────────────────────────────────────────────
    searchQuery = '';
    selectedCategoryId: number | null = null;
    selectedYear: number | null = null;
    selectedDirector = '';

    // ── State ──────────────────────────────────────────────────────────────
    loading = true;
    searching = false;

    private searchSubject = new Subject<string>();

    ngOnInit(): void {
        // Check for category filter from query params
        this.route.queryParamMap.subscribe(params => {
            const categoryId = params.get('categoryId');
            if (categoryId) {
                this.selectedCategoryId = +categoryId;
            }
        });

        this.loadCategories();
        this.loadAllMovies();

        // Debounced search
        this.searchSubject
            .pipe(debounceTime(300), distinctUntilChanged())
            .subscribe((query) => {
                this.searchQuery = query;
                this.applyFilters();
            });
    }

    private loadCategories(): void {
        this.categoryService.getPublicAll().subscribe({
            next: (cats) => {
                this.categories = cats;
                this.cdr.detectChanges();
            },
        });
    }

    private loadAllMovies(): void {
        this.loading = true;
        // Load all movies from public endpoint (no auth required)
        this.movieService.getPublicAll().subscribe({
            next: (movies) => {
                this.allMovies = movies;
                this.filteredMovies = movies;
                this.extractFilterOptions(movies);
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.cdr.detectChanges();
            },
        });
    }

    private extractFilterOptions(movies: MovieDTO[]): void {
        // Extract unique directors
        const directorSet = new Set<string>();
        movies.forEach((m) => {
            if (m.director) directorSet.add(m.director);
        });
        this.directors = Array.from(directorSet).sort();

        // Extract unique years
        const yearSet = new Set<number>();
        movies.forEach((m) => {
            if (m.releaseYear) yearSet.add(m.releaseYear);
        });
        this.years = Array.from(yearSet).sort((a, b) => b - a);
    }

    // ── Search & Filter ────────────────────────────────────────────────────

    onSearchInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.searchSubject.next(value);
    }

    onCategoryChange(categoryId: string): void {
        this.selectedCategoryId = categoryId ? +categoryId : null;
        this.applyFilters();
    }

    onYearChange(year: string): void {
        this.selectedYear = year ? +year : null;
        this.applyFilters();
    }

    onDirectorChange(director: string): void {
        this.selectedDirector = director;
        this.applyFilters();
    }

    clearFilters(): void {
        this.searchQuery = '';
        this.selectedCategoryId = null;
        this.selectedYear = null;
        this.selectedDirector = '';
        this.filteredMovies = [...this.allMovies];
        this.cdr.detectChanges();
    }

    get hasActiveFilters(): boolean {
        return (
            this.searchQuery.trim().length > 0 ||
            this.selectedCategoryId !== null ||
            this.selectedYear !== null ||
            this.selectedDirector !== ''
        );
    }

    private applyFilters(): void {
        this.searching = true;
        this.cdr.detectChanges();

        let results = [...this.allMovies];

        // Text search
        if (this.searchQuery.trim()) {
            const q = this.searchQuery.trim().toLowerCase();
            results = results.filter(
                (m) =>
                    m.title?.toLowerCase().includes(q) ||
                    m.director?.toLowerCase().includes(q) ||
                    m.actors?.toLowerCase().includes(q) ||
                    m.synopsis?.toLowerCase().includes(q)
            );
        }

        // Category filter
        if (this.selectedCategoryId !== null) {
            results = results.filter(
                (m) => m.categoryId === this.selectedCategoryId
            );
        }

        // Year filter
        if (this.selectedYear !== null) {
            results = results.filter(
                (m) => m.releaseYear === this.selectedYear
            );
        }

        // Director filter
        if (this.selectedDirector) {
            results = results.filter(
                (m) => m.director === this.selectedDirector
            );
        }

        this.filteredMovies = results;
        this.searching = false;
        this.cdr.detectChanges();
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    goToMovie(id: number): void {
        this.router.navigate(['/movie', id]);
    }

    getImageUrl(path: string | null): string {
        if (!path) return '';
        return path.startsWith('http') ? path : this.apiUrl + path;
    }

    getInitials(title: string): string {
        return title
            .split(' ')
            .map((w) => w[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }

    getCategoryName(id: number): string {
        return this.categories.find((c) => c.id === id)?.name ?? '';
    }
}
