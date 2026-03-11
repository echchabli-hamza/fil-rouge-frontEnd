import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
    templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
    auth = inject(AuthService);
    sidebarOpen = false;

    logout(): void {
        this.auth.logout();
    }
}
