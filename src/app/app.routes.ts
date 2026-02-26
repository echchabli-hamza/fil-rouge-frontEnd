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

    // Admin dashboard – admin only
    {
        path: 'dash',
        canActivate: [authGuard, adminGuard],
        loadComponent: () =>
            import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
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
