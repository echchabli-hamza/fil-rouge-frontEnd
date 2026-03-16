import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Comment {
    id?: number;
    text?: string;
    createdAt?: string;
    user?: { id: number; name: string; email: string };
    movie?: { id: number; title: string };
}

@Injectable({ providedIn: 'root' })
export class CommentService {
    private base = `${environment.apiUrl}/comments`;

    constructor(private http: HttpClient) { }

    /** GET /comments/movie/{movieId} — public */
    getByMovie(movieId: number): Observable<Comment[]> {
        return this.http.get<Comment[]>(`${this.base}/movie/${movieId}`);
    }

    /** POST /comments — authenticated */
    create(movieId: number, text: string): Observable<Comment> {
        return this.http.post<Comment>(this.base, { movieId, text });
    }

    /** PUT /comments/{id} — authenticated */
    update(id: number, text: string): Observable<Comment> {
        return this.http.put<Comment>(`${this.base}/${id}`, { text });
    }

    /** DELETE /comments/{id} — authenticated */
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }
}
