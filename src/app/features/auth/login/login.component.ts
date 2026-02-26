import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html',
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private router = inject(Router);

    loading = signal(false);
    error = signal<string | null>(null);

    form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        rememberMe: [true],
    });

    onSubmit(): void {
        this.error.set(null);
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        this.auth.login(this.form.getRawValue()).subscribe({
            next: () => {
                this.router.navigateByUrl(this.auth.getPostLoginUrl());
            },
            error: (err) => {
                this.loading.set(false);
                this.error.set(err.error?.message ?? 'Connexion échouée. Vérifiez vos identifiants.');
            },
            complete: () => this.loading.set(false),
        });
    }
}
