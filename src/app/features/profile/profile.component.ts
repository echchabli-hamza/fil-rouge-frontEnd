import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="dashboard">
            <div class="dashboard-header">
                <h1>Profil</h1>
                <p>{{ auth.getUser()?.name }} — {{ auth.getUser()?.email }}</p>
            </div>
        </div>
    `,
})
export class ProfileComponent {
    auth = inject(AuthService);
}
