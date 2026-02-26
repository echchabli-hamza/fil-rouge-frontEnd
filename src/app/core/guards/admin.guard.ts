import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.getUser();

    if (auth.isLoggedIn() && user?.role?.toLowerCase() === 'admin') {
        return true;
    }

    return router.createUrlTree(['/']);
};
