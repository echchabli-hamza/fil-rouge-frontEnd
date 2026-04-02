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
                this.error = 'Failed to load users';
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
                this.error = err?.statusText || 'Failed to update user status';
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
