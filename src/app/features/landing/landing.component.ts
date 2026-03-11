import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MovieService } from '../../core/services/movie.service';
import { CategoryService } from '../../core/services/category.service';
import { MovieDTO, Category } from '../../core/models/admin.models';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './landing.component.html',
})
export class LandingComponent implements OnInit, OnDestroy {
    private auth = inject(AuthService);
    private movieService = inject(MovieService);
    private categoryService = inject(CategoryService);
    private cdr = inject(ChangeDetectorRef);

    readonly apiUrl = environment.apiUrl;

    get isLoggedIn(): boolean {
        return this.auth.isLoggedIn();
    }

    heroSlide = 0;
    private heroTimer: any;
    loading = true;
    private pendingCalls = 5;

    heroMovies: MovieDTO[] = [];
    trendingMovies: MovieDTO[] = [];
    newReleases: MovieDTO[] = [];
    topMovies: MovieDTO[] = [];
    categories: Category[] = [];

    private categoryIcons: Record<string, string> = {
        'Action': '💥', 'Comédie': '😂', 'Drame': '🎭', 'Science-Fiction': '🚀',
        'Horreur': '👻', 'Romance': '❤️', 'Thriller': '🔪', 'Animation': '🎨',
        'Aventure': '🏔️', 'Documentaire': '📹', 'Fantastique': '🧙', 'Guerre': '⚔️',
        'Historique': '📜', 'Musical': '🎵', 'Policier': '🔍', 'Western': '🤠',
    };

    ngOnInit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {
        clearInterval(this.heroTimer);
    }

    private onCallDone(): void {
        this.pendingCalls--;
        if (this.pendingCalls <= 0) {
            this.loading = false;
            // Fallback: if featured returned nothing, use trending for hero
            if (this.heroMovies.length === 0 && this.trendingMovies.length > 0) {
                this.heroMovies = this.trendingMovies.slice(0, 5);
            }
            if (this.heroMovies.length > 0) {
                this.startHeroTimer();
            }
            this.cdr.detectChanges();
        }
    }

    private loadData(): void {
        this.movieService.getFeatured().subscribe({
            next: (data) => { this.heroMovies = data; this.cdr.detectChanges(); },
            error: (e) => { console.error('featured error', e); this.onCallDone(); },
            complete: () => this.onCallDone(),
        });

        this.movieService.getTrending().subscribe({
            next: (data) => { this.trendingMovies = data; this.cdr.detectChanges(); },
            error: (e) => { console.error('trending error', e); this.onCallDone(); },
            complete: () => this.onCallDone(),
        });

        this.movieService.getNewReleases().subscribe({
            next: (data) => { this.newReleases = data; this.cdr.detectChanges(); },
            error: (e) => { console.error('newReleases error', e); this.onCallDone(); },
            complete: () => this.onCallDone(),
        });

        this.movieService.getTopRated().subscribe({
            next: (data) => { this.topMovies = data; this.cdr.detectChanges(); },
            error: (e) => { console.error('topRated error', e); this.onCallDone(); },
            complete: () => this.onCallDone(),
        });

        this.categoryService.getPublicAll().subscribe({
            next: (data) => { this.categories = data; this.cdr.detectChanges(); },
            error: (e) => { console.error('categories error', e); this.onCallDone(); },
            complete: () => this.onCallDone(),
        });
    }

    getCategoryIcon(name: string): string {
        return this.categoryIcons[name] || '🎬';
    }

    getImageUrl(path: string | null): string {
        if (!path) return '';
        return path.startsWith('http') ? path : this.apiUrl + path;
    }

    nextSlide(): void {
        this.heroSlide = (this.heroSlide + 1) % this.heroMovies.length;
        this.restartTimer();
    }

    prevSlide(): void {
        this.heroSlide = (this.heroSlide - 1 + this.heroMovies.length) % this.heroMovies.length;
        this.restartTimer();
    }

    goToSlide(i: number): void {
        this.heroSlide = i;
        this.restartTimer();
    }

    getInitials(title: string): string {
        return title.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    }

    private startHeroTimer(): void {
        this.heroTimer = setInterval(() => this.nextSlide(), 6000);
    }

    private restartTimer(): void {
        clearInterval(this.heroTimer);
        this.startHeroTimer();
    }
}
