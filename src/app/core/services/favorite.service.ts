import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Favorite } from '../models/admin.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
    private base = `${environment.apiUrl}/user/favorites`;

    constructor(private http: HttpClient) {}

    /** POST /user/favorites/{userId}/{movieId} */
    add(userId: number, movieId: number): Observable<Favorite> {
        return this.http.post<Favorite>(`${this.base}/${userId}/${movieId}`, {});
    }

    /** DELETE /user/favorites/{userId}/{movieId} */
    remove(userId: number, movieId: number): Observable<void> {
        return this.http.delete<void>(`${this.base}/${userId}/${movieId}`);
    }

    /** GET /user/favorites/user/{userId} */
    getByUser(userId: number): Observable<Favorite[]> {
        return this.http.get<Favorite[]>(`${this.base}/user/${userId}`);
    }
}
