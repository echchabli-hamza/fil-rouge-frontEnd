import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="dashboard">
            <div class="dashboard-header">
                <h1>Paramètres</h1>
                <p>Réglages à venir.</p>
            </div>
        </div>
    `,
})
export class SettingsComponent {}
