import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5131/api/Auth';
  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() { }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        console.log('AuthService response', response);
        // API may return PascalCase (Token, Role) or camelCase (token, role)
        const token = response.token ?? response.Token;
        const role = response.role ?? response.Role;
        console.log('Parsed token/role', token, role);
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('role', role ?? 'Student');
          localStorage.setItem('user', JSON.stringify(response));
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserRole(): string {
    return localStorage.getItem('role') || '';
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
