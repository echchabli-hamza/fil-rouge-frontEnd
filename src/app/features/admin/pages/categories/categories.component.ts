import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models/admin.models';

@Component({
    selector: 'app-categories',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './categories.component.html',
})
export class CategoriesComponent implements OnInit {
    private svc = inject(CategoryService);

    categories = signal<Category[]>([]);
    loading = signal(false);
    error = signal('');
    successMsg = signal('');

    // Form state
    showForm = false;
    editingId: number | null = null;
    form: { name: string; imagePath: string } = { name: '', imagePath: '' };
    selectedFile: File | null = null;
    imagePreview: string | null = null;
    saving = false;

    // Delete confirm
    deletingId: number | null = null;

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading.set(true);
        this.error.set('');
        this.svc.getAll().subscribe({
            next: (data) => { this.categories.set(data); this.loading.set(false); console.log(data); },
            error: () => { this.error.set('Erreur lors du chargement des catégories.'); this.loading.set(false); },
        });
    }

    openAdd(): void {
        this.editingId = null;
        this.form = { name: '', imagePath: '' };
        this.selectedFile = null;
        this.imagePreview = null;
        this.showForm = true;
    }

    openEdit(cat: Category): void {
        this.editingId = cat.id ?? null;
        this.form = { name: cat.name, imagePath: cat.imagePath ?? '' };
        this.selectedFile = null;
        this.imagePreview = cat.imagePath
            ? (cat.imagePath.startsWith('http') ? cat.imagePath : `${this.svc.apiUrl}/${cat.imagePath}`)
            : null;
        this.showForm = true;
    }

    closeForm(): void {
        this.showForm = false;
        this.selectedFile = null;
        this.imagePreview = null;
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            // Show a local preview
            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreview = reader.result as string;
            };
            reader.readAsDataURL(this.selectedFile);
        }
    }

    save(): void {
        if (!this.form.name.trim()) return;
        this.saving = true;

        const categoryData: Category = { name: this.form.name };

        if (this.editingId) {
            // Update: with or without a new image
            const obs = this.selectedFile
                ? this.svc.update(this.editingId, categoryData, this.selectedFile)
                : this.svc.update(this.editingId, categoryData);

            obs.subscribe({
                next: () => {
                    this.saving = false;
                    this.showForm = false;
                    this.showSuccess('Catégorie mise à jour.');
                    this.load();
                },
                error: () => {
                    this.saving = false;
                    this.error.set('Erreur lors de la sauvegarde.');
                },
            });
        } else {
            // Create: image is required by the service
            if (!this.selectedFile) {
                this.saving = false;
                this.error.set('Veuillez sélectionner une image pour la nouvelle catégorie.');
                return;
            }
            this.svc.create(categoryData, this.selectedFile).subscribe({
                next: () => {
                    this.saving = false;
                    this.showForm = false;
                    this.showSuccess('Catégorie créée.');
                    this.load();
                },
                error: () => {
                    this.saving = false;
                    this.error.set('Erreur lors de la sauvegarde.');
                },
            });
        }
    }

    confirmDelete(id: number): void {
        this.deletingId = id;
    }

    cancelDelete(): void {
        this.deletingId = null;
    }

    doDelete(): void {
        if (this.deletingId === null) return;
        this.svc.delete(this.deletingId).subscribe({
            next: () => {
                this.deletingId = null;
                this.showSuccess('Catégorie supprimée.');
                this.load();
            },
            error: () => { this.error.set('Erreur lors de la suppression.'); this.deletingId = null; },
        });
    }

    getImageSrc(path: string): string {
        if (path.startsWith('http')) return path;
        return `${this.svc.apiUrl}${path}`;
    }

    private showSuccess(msg: string): void {
        this.successMsg.set(msg);
        setTimeout(() => this.successMsg.set(''), 3000);
    }
}
