import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
    // Landing page (public)
    {
        path: '',
        loadComponent: () =>
            import('./features/landing/landing.component').then((m) => m.LandingComponent),
    },

    // Auth pages 
    {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    },
    {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
    },

    // Admin area – admin only
    {
        path: 'dash',
        canActivate: [authGuard, adminGuard],
        loadComponent: () =>
            import('./features/admin/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
        children: [
            { path: '', redirectTo: 'categories', pathMatch: 'full' },
            {
                path: 'categories',
                loadComponent: () =>
                    import('./features/admin/pages/categories/categories.component').then((m) => m.CategoriesComponent),
            },
            {
                path: 'movies',
                loadComponent: () =>
                    import('./features/admin/pages/movies/movies.component').then((m) => m.MoviesComponent),
            },
        ],
    },

    // Movie detail (public)
    {
        path: 'movie/:id',
        loadComponent: () =>
            import('./features/movie-detail/movie-detail.component').then((m) => m.MovieDetailComponent),
    },

    // Protected pages (auth required)
    {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/profile/profile.component').then((m) => m.ProfileComponent),
    },
    {
        path: 'settings',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./features/settings/settings.component').then((m) => m.SettingsComponent),
    },

    { path: '**', redirectTo: '' },
];
