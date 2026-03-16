import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserList, ListMovie } from '../models/admin.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserListService {
    private listBase = `${environment.apiUrl}/user/lists`;
    private listMovieBase = `${environment.apiUrl}/user/list-movies`;

    constructor(private http: HttpClient) { }

    // ── User Lists ────────────────────────────────────────────────────────

    /** POST /user/lists */
    createList(list: UserList): Observable<UserList> {
        return this.http.post<UserList>(this.listBase, list);
    }

    /** GET /user/lists */
    getAllLists(): Observable<UserList[]> {
        return this.http.get<UserList[]>(this.listBase);
    }

    /** GET /user/lists/user/{userId} */
    getListsByUser(userId: number): Observable<UserList[]> {
        return this.http.get<UserList[]>(`${this.listBase}/user/${userId}`);
    }

    /** GET /user/lists/{id} */
    getList(id: number): Observable<UserList> {
        return this.http.get<UserList>(`${this.listBase}/${id}`);
    }

    /** DELETE /user/lists/{id} */
    deleteList(id: number): Observable<void> {
        return this.http.delete<void>(`${this.listBase}/${id}`);
    }

    // ── List Movies ───────────────────────────────────────────────────────

    /** POST /user/list-movies/{listId}/{movieId} */
    addMovieToList(listId: number, movieId: number): Observable<ListMovie> {
        return this.http.post<ListMovie>(`${this.listMovieBase}/${listId}/${movieId}`, {});
    }

    /** DELETE /user/list-movies/{listId}/{movieId} */
    removeMovieFromList(listId: number, movieId: number): Observable<void> {
        return this.http.delete<void>(`${this.listMovieBase}/${listId}/${movieId}`);
    }

    /** GET /user/list-movies/{listId} */
    getMoviesInList(listId: number): Observable<ListMovie[]> {
        return this.http.get<ListMovie[]>(`${this.listMovieBase}/${listId}`);
    }
}
