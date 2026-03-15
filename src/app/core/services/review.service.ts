import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/admin.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewService {
    private base = `${environment.apiUrl}/reviews`;

    constructor(private http: HttpClient) {}

    /** GET /reviews/movie/{movieId} — public */
    getByMovie(movieId: number): Observable<Review[]> {
        return this.http.get<Review[]>(`${this.base}/movie/${movieId}`);
    }

    /** POST /reviews — authenticated */
    create(movieId: number, rating: number, comment?: string): Observable<Review> {
        return this.http.post<Review>(this.base, { movieId, rating, comment });
    }

    /** PUT /reviews/{id} — authenticated */
    update(id: number, rating: number, comment?: string): Observable<Review> {
        return this.http.put<Review>(`${this.base}/${id}`, { rating, comment });
    }

    /** DELETE /reviews/{id} — authenticated */
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}
