import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
    private authService = inject(AuthService);
    private profileService = inject(ProfileService);

    // Username form
    newUsername = '';
    usernameMessage = '';
    usernameError = false;
    usernameLoading = false;

    // Password form
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
    passwordMessage = '';
    passwordError = false;
    passwordLoading = false;

    currentUserName = '';

    ngOnInit(): void {
        this.loadCurrentUser();
    }

    loadCurrentUser(): void {
        const user = this.authService.getUser();
        if (user) {
            this.currentUserName = user.name;
            this.newUsername = user.name;
        }
    }

    updateUsername(): void {
        if (!this.newUsername.trim()) {
            this.usernameError = true;
            this.usernameMessage = 'Username cannot be empty';
            return;
        }

        this.usernameLoading = true;
        this.profileService.updateUsername(this.newUsername.trim()).subscribe({
            next: (response) => {
                this.usernameError = false;
                this.usernameMessage = 'Username updated successfully!';
                this.currentUserName = response.name;
                this.usernameLoading = false;
                setTimeout(() => this.usernameMessage = '', 3000);
            },
            error: (error) => {
                this.usernameError = true;
                this.usernameMessage = error.error?.message || 'Failed to update username';
                this.usernameLoading = false;
            }
        });
    }

    updatePassword(): void {
        if (!this.currentPassword) {
            this.passwordError = true;
            this.passwordMessage = 'Current password is required';
            return;
        }

        if (!this.newPassword || this.newPassword.length < 6) {
            this.passwordError = true;
            this.passwordMessage = 'New password must be at least 6 characters';
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.passwordError = true;
            this.passwordMessage = 'Passwords do not match';
            return;
        }

        this.passwordLoading = true;
        this.profileService.updatePassword(this.currentPassword, this.newPassword).subscribe({
            next: (response) => {
                this.passwordError = false;
                this.passwordMessage = 'Password updated successfully!';
                this.currentPassword = '';
                this.newPassword = '';
                this.confirmPassword = '';
                this.passwordLoading = false;
                setTimeout(() => this.passwordMessage = '', 3000);
            },
            error: (error) => {
                this.passwordError = true;
                this.passwordMessage = error.error?.message || 'Failed to update password';
                this.passwordLoading = false;
            }
        });
    }
}

