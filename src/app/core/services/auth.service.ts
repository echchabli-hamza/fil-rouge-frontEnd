import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../models/auth.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly TOKEN_KEY = 'mt_token';
    private readonly USER_KEY = 'mt_user';

    private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) { }

    login(req: LoginRequest): Observable<LoginResponse> {
        const { rememberMe, ...body } = req;
        return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, body).pipe(
            tap((res) => this.handleAuthResponse(res, req.email, rememberMe))
        );
    }

    register(req: RegisterRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/register`, req).pipe(
            tap((res) => this.handleAuthResponse(res, req.email, true))
        );
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.USER_KEY);
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY) ?? sessionStorage.getItem(this.TOKEN_KEY);
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    getUser(): User | null {
        return this.currentUserSubject.value;
    }

    getPostLoginUrl(): string {
        const user = this.getUser();
        if (!user) return '/';
        return user.role?.toLowerCase() === 'admin' ? '/dash' : '/';
    }

    private handleAuthResponse(res: LoginResponse, email: string, remember = true): void {
        const storage = remember ? localStorage : sessionStorage;
        const user: User = {
            name: res.name ?? email.split('@')[0],
            email: res.email ?? email,
            role: res.role,
        };
        storage.setItem(this.TOKEN_KEY, res.token);
        storage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
    }

    private loadUser(): User | null {
        const raw = localStorage.getItem(this.USER_KEY) ?? sessionStorage.getItem(this.USER_KEY);
        return raw ? JSON.parse(raw) : null;
    }
}
