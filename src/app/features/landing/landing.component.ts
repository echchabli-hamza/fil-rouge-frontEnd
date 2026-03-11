import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './landing.component.html',
})
export class LandingComponent {
    // Placeholder data — will be replaced with real API calls
    heroSlide = 0;

    heroMovies = [
        { id: 1, title: 'Placeholder Film 1', category: 'Action', synopsis: 'Synopsis placeholder text goes here...', year: 2026, rating: 8.5 },
        { id: 2, title: 'Placeholder Film 2', category: 'Drame', synopsis: 'Another synopsis placeholder...', year: 2025, rating: 9.1 },
        { id: 3, title: 'Placeholder Film 3', category: 'Sci-Fi', synopsis: 'Third synopsis placeholder...', year: 2026, rating: 7.8 },
    ];

    trendingMovies = Array.from({ length: 6 }, (_, i) => ({
        id: i + 10, title: `Trending ${i + 1}`, year: 2026, rating: +(7 + Math.random() * 2).toFixed(1),
    }));

    newReleases = Array.from({ length: 6 }, (_, i) => ({
        id: i + 20, title: `New Release ${i + 1}`, year: 2026, rating: +(7 + Math.random() * 2).toFixed(1),
    }));

    topMovies = Array.from({ length: 6 }, (_, i) => ({
        id: i + 30, title: `Top Film ${i + 1}`, year: 2025, rating: +(8 + Math.random()).toFixed(1),
    }));

    categories = [
        { id: 1, name: 'Action', icon: '💥' },
        { id: 2, name: 'Comédie', icon: '😂' },
        { id: 3, name: 'Drame', icon: '🎭' },
        { id: 4, name: 'Science-Fiction', icon: '🚀' },
        { id: 5, name: 'Horreur', icon: '👻' },
        { id: 6, name: 'Romance', icon: '❤️' },
        { id: 7, name: 'Thriller', icon: '🔪' },
        { id: 8, name: 'Animation', icon: '🎨' },
    ];

    nextSlide(): void {
        this.heroSlide = (this.heroSlide + 1) % this.heroMovies.length;
    }
    prevSlide(): void {
        this.heroSlide = (this.heroSlide - 1 + this.heroMovies.length) % this.heroMovies.length;
    }
    goToSlide(i: number): void {
        this.heroSlide = i;
    }
    getInitials(title: string): string {
        return title.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    }
}
