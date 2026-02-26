import { Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { filter } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, AsyncPipe],
    templateUrl: './navbar.component.html',
})
export class NavbarComponent {
    private router = inject(Router);
    private authService = inject(AuthService);

    currentUser$ = this.authService.currentUser$;
    menuOpen = false;

    isAuthPage = false;

    constructor() {
        this.router.events
            .pipe(filter((e) => e instanceof NavigationEnd))
            .subscribe((e: any) => {
                this.isAuthPage = e.url.includes('/login') || e.url.includes('/register');
                this.menuOpen = false;
            });
    }

    logout(): void {
        this.authService.logout();
    }

    getUserInitials(name: string): string {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }
}
