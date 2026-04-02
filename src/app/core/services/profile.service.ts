import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/user/profile`;

    updateUsername(username: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/username`, { username });
    }

    updatePassword(currentPassword: string, newPassword: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/password`, { 
            currentPassword, 
            newPassword 
        });
    }

    getProfile(): Observable<any> {
        return this.http.get(this.apiUrl);
    }
}
