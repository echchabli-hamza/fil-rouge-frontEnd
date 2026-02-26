import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register.component.html',
})
export class RegisterComponent {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private router = inject(Router);

    loading = signal(false);
    error = signal<string | null>(null);

    form = this.fb.nonNullable.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
    });

    onSubmit(): void {
        this.error.set(null);
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        this.auth.register(this.form.getRawValue()).subscribe({
            next: () => {
                this.router.navigateByUrl(this.auth.getPostLoginUrl());
            },
            error: (err) => {
                this.loading.set(false);
                const msg = err.error?.message ?? err.error?.error;
                this.error.set(msg ?? 'Inscription échouée. Cet email est peut-être déjà utilisé.');
            },
            complete: () => this.loading.set(false),
        });
    }
}
