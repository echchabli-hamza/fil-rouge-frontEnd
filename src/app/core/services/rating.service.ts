import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Rating {
    id?: number;
    rating?: number;
    createdAt?: string;
    user?: { id: number; name: string; email: string };
    movie?: { id: number; title: string };
}

@Injectable({ providedIn: 'root' })
export class RatingService {
    private base = `${environment.apiUrl}/ratings`;

    constructor(private http: HttpClient) { }

    /** GET /ratings/movie/{movieId} — public */
    getByMovie(movieId: number): Observable<Rating[]> {
        return this.http.get<Rating[]>(`${this.base}/movie/${movieId}`);
    }

    /** POST /ratings — authenticated, upserts (one per user per movie) */
    upsert(movieId: number, rating: number): Observable<Rating> {
        return this.http.post<Rating>(this.base, { movieId, rating });
    }

    /** DELETE /ratings/{id} — authenticated */
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}
