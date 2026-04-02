import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly THEME_KEY = 'app_theme';
    theme = signal<'light' | 'dark'>(this.loadTheme());

    constructor() {
        effect(() => {
            const theme = this.theme();
            this.applyTheme(theme);
            localStorage.setItem(this.THEME_KEY, theme);
        });
    }

    private loadTheme(): 'light' | 'dark' {
        const saved = localStorage.getItem(this.THEME_KEY);
        if (saved === 'light' || saved === 'dark') {
            return saved;
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    }

    private applyTheme(theme: 'light' | 'dark'): void {
        const root = document.documentElement;
        root.classList.remove('light-theme', 'dark-theme');
        root.classList.add(`${theme}-theme`);
    }

    setTheme(theme: 'light' | 'dark'): void {
        this.theme.set(theme);
    }

    toggleTheme(): void {
        const current = this.theme();
        this.theme.set(current === 'light' ? 'dark' : 'light');
    }
}
