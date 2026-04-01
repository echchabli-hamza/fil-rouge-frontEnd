import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, AdminUser } from '../../../../core/services/user.service';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
    private userService = inject(UserService);
    private cdr = inject(ChangeDetectorRef);

    users: AdminUser[] = [];
    loading = true;
    updating: { [key: number]: boolean } = {};
    error: string | null = null;
    successMessage: string | null = null;

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.loading = true;
        this.error = null;
        this.userService.getAllUsers().subscribe({
            next: (data: AdminUser[]) => {
                this.users = data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Error loading users:', err);
                const errorMsg = err?.error?.message || err?.statusText || 'Failed to load users';
                this.error = errorMsg;
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    toggleUserStatus(user: AdminUser): void {
        this.updating[user.id] = true;
        this.cdr.detectChanges();

        this.userService.updateUserActiveStatus(user.id, !user.active).subscribe({
            next: (updatedUser: AdminUser) => {
                const index = this.users.findIndex(u => u.id === user.id);
                if (index !== -1) {
                    this.users[index] = updatedUser;
                }
                this.updating[user.id] = false;
                this.showSuccessMessage(`User ${updatedUser.active ? 'activated' : 'deactivated'} successfully`);
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Full error object:', err);
                console.error('Error status:', err?.status);
                console.error('Error statusText:', err?.statusText);
                console.error('Error message:', err?.message);
                console.error('Error response:', err?.error);
                
                let errorMsg = 'Unknown Error';
                if (err?.status === 401) {
                    errorMsg = 'Unauthorized - Please login again';
                } else if (err?.status === 403) {
                    errorMsg = 'Forbidden - You do not have permission to update users';
                } else if (err?.status === 404) {
                    errorMsg = 'User not found';
                } else if (err?.statusText) {
                    errorMsg = err.statusText;
                } else if (err?.error?.message) {
                    errorMsg = err.error.message;
                } else if (err?.message) {
                    errorMsg = err.message;
                }
                
                this.error = errorMsg;
                this.updating[user.id] = false;
                this.cdr.detectChanges();
            }
        });
    }

    private showSuccessMessage(message: string): void {
        this.successMessage = message;
        setTimeout(() => {
            this.successMessage = null;
            this.cdr.detectChanges();
        }, 3000);
    }

    getRoleColor(role: string): string {
        switch (role) {
            case 'ADMIN': return '#e50914';
            case 'VIEWER': return '#0066cc';
            default: return '#888';
        }
    }
}
