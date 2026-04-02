import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserListService } from '../../core/services/user-list.service';
import { UserList, MovieDTO } from '../../core/models/admin.models';
import { ListMoviesModalComponent } from '../../shared/components/list-movies-modal/list-movies-modal.component';
import { environment } from '../../../environments/environment';

interface UserListDisplay extends UserList {
    movieDetails?: MovieDTO[];
}

@Component({
    selector: 'app-user-lists',
    standalone: true,
    imports: [CommonModule, FormsModule, ListMoviesModalComponent],
    templateUrl: './user-lists.component.html',
    styleUrls: ['./user-lists.component.css']
})
export class UserListsComponent implements OnInit {
    private userListService = inject(UserListService);
    private cdr = inject(ChangeDetectorRef);

    readonly apiUrl = environment.apiUrl;

    // State
    allLists: UserListDisplay[] = [];
    filteredLists: UserListDisplay[] = [];
    loading = true;
    searchTerm = '';
    selectedListId: number | null = null;

    // Modal state
    modalOpen = false;
    modalList: UserListDisplay | null = null;
    modalMovies: MovieDTO[] = [];
    modalLoading = false;

    // Pagination
    currentPage = 1;
    itemsPerPage = 12;

    ngOnInit(): void {
        this.loadPublicLists();
    }

    private loadPublicLists(): void {
        this.loading = true;
        this.userListService.getAllLists().subscribe({
            next: (lists: UserList[]) => {
                // Filter only public lists
                this.allLists = lists
                    .filter(list => list.isPublic)
                    .map(list => ({ ...list }));
                
                this.applySearch();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (e: any) => {
                console.error('Error loading public lists', e);
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    private applySearch(): void {
        if (!this.searchTerm.trim()) {
            this.filteredLists = [...this.allLists];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.filteredLists = this.allLists.filter(list =>
                list.title?.toLowerCase().includes(term)
            );
        }
        this.currentPage = 1;
    }

    onSearch(): void {
        this.applySearch();
        this.cdr.detectChanges();
    }

    openModal(list: UserListDisplay): void {
        this.modalList = list;
        this.modalMovies = [];
        this.modalLoading = true;
        this.modalOpen = true;
        
        // Load movies for this list
        this.loadListMovies(list);
    }

    closeModal(): void {
        this.modalOpen = false;
        this.modalList = null;
        this.modalMovies = [];
        this.cdr.detectChanges();
    }

    private loadListMovies(list: UserListDisplay): void {
        if (!list.id) {
            this.modalMovies = [];
            this.modalLoading = false;
            this.cdr.detectChanges();
            return;
        }

        // Fetch movies directly from the new endpoint
        this.userListService.getListMovies(list.id as number).subscribe({
            next: (movies: MovieDTO[]) => {
                this.modalMovies = movies;
                this.modalLoading = false;
                this.cdr.detectChanges();
            },
            error: (e: any) => {
                console.error('Error loading list movies', e);
                this.modalMovies = [];
                this.modalLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    get paginatedLists(): UserListDisplay[] {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredLists.slice(start, end);
    }

    get totalPages(): number {
        return Math.ceil(this.filteredLists.length / this.itemsPerPage);
    }

    previousPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.cdr.detectChanges();
        }
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.cdr.detectChanges();
        }
    }

    getImageUrl(imagePath?: string): string {
        return imagePath ? `${this.apiUrl}${imagePath}` : `${this.apiUrl}/images/placeholder.png`;
    }
}
