import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie, MovieDTO } from '../models/admin.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MovieService {
    private base = `${environment.apiUrl}/admin/movies`;
    private publicBase = `${environment.apiUrl}/movies`;
    readonly apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // ── Admin endpoints ───────────────────────────────────────────────────────

    getAll(): Observable<MovieDTO[]> {
        return this.http.get<MovieDTO[]>(this.base);
    }

    getOne(id: number): Observable<MovieDTO> {
        return this.http.get<MovieDTO>(`${this.base}/${id}`);
    }

    create(movie: Movie, image: File): Observable<Movie> {
        const fd = new FormData();
        fd.append('movie', new Blob([JSON.stringify(movie)], { type: 'application/json' }));
        fd.append('image', image);
        return this.http.post<Movie>(this.base, fd);
    }

    update(id: number, movie: Movie): Observable<Movie>;
    update(id: number, movie: Movie, image: File): Observable<Movie>;
    update(id: number, movie: Movie, image?: File): Observable<Movie> {
        if (image) {
            const fd = new FormData();
            fd.append('movie', new Blob([JSON.stringify(movie)], { type: 'application/json' }));
            fd.append('image', image);
            return this.http.put<Movie>(`${this.base}/${id}`, fd);
        }
        return this.http.put<Movie>(`${this.base}/${id}`, movie);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${id}`);
    }

    // ── Public endpoints (no auth required) ──────────────────────────────────

    getFeatured(): Observable<MovieDTO[]> {
        return this.http.get<MovieDTO[]>(`${this.publicBase}/featured`);
    }

    getTrending(): Observable<MovieDTO[]> {
        return this.http.get<MovieDTO[]>(`${this.publicBase}/trending`);
    }

    getNewReleases(): Observable<MovieDTO[]> {
        return this.http.get<MovieDTO[]>(`${this.publicBase}/new-releases`);
    }

    getTopRated(): Observable<MovieDTO[]> {
        return this.http.get<MovieDTO[]>(`${this.publicBase}/top-rated`);
    }
}
