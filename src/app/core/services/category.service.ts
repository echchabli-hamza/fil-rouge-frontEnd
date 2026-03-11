import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/admin.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
    private base = `${environment.apiUrl}/admin/categories`;
    private publicBase = `${environment.apiUrl}/categories`;
    readonly apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    /** GET /categories — public, no auth */
    getPublicAll(): Observable<Category[]> {
        return this.http.get<Category[]>(this.publicBase);
    }

    getAll(): Observable<Category[]> {
        return this.http.get<Category[]>(this.base);
    }

    getOne(id: number): Observable<Category> {
        return this.http.get<Category>(`${this.base}/${id}`);
    }

    /** POST /admin/categories  –  multipart (category + image) */
    create(category: Category, image: File): Observable<Category> {
        const fd = new FormData();
        fd.append('category', new Blob([JSON.stringify(category)], { type: 'application/json' }));
        fd.append('image', image);
        return this.http.post<Category>(this.base, fd);
    }

    /** PUT /admin/categories/{id}  –  JSON (no new image) */
    update(id: number, category: Category): Observable<Category>;
    /** PUT /admin/categories/{id}  –  multipart (with new image) */
    update(id: number, category: Category, image: File): Observable<Category>;
    update(id: number, category: Category, image?: File): Observable<Category> {
        if (image) {
            const fd = new FormData();
            fd.append('category', new Blob([JSON.stringify(category)], { type: 'application/json' }));
            fd.append('image', image);
            return this.http.put<Category>(`${this.base}/${id}`, fd);
        }
        return this.http.put<Category>(`${this.base}/${id}`, category);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}
