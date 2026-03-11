import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/layout/navbar/navbar.component';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NavbarComponent],
    templateUrl: './app.html',
})
export class App implements OnInit {
    private router = inject(Router);
    hideNavbar = signal(false);

    ngOnInit(): void {
        this.updateHideNavbar(this.router.url);
        this.router.events
            .pipe(filter((e) => e instanceof NavigationEnd))
            .subscribe((e) => this.updateHideNavbar((e as NavigationEnd).url));
    }

    private updateHideNavbar(url: string): void {
        this.hideNavbar.set(
            url.includes('/login') || url.includes('/register')
        );
    }
}
