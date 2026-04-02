import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MovieDTO, UserList } from '../../../core/models/admin.models';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-list-movies-modal',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './list-movies-modal.component.html',
    styleUrls: ['./list-movies-modal.component.css']
})
export class ListMoviesModalComponent {
    @Input() isOpen = false;
    @Input() list: UserList | null = null;
    @Input() movies: MovieDTO[] = [];
    @Input() loading = false;
    @Output() close = new EventEmitter<void>();

    readonly apiUrl = environment.apiUrl;
    private router = inject(Router);

    closeModal(): void {
        this.close.emit();
    }

    getImageUrl(imagePath?: string): string {
        return imagePath ? `${this.apiUrl}${imagePath}` : `${this.apiUrl}/images/placeholder.png`;
    }

    onBackdropClick(): void {
        this.closeModal();
    }

    navigateToMovie(movieId: number): void {
        this.router.navigate(['/movie', movieId]);
        this.closeModal();
    }
}
