import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import environment from '../../environments/environment';

export interface AuthResponse {
  token: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'chemical_compounds_token';
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();
  
  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }
  
  private loadStoredUser() {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      try {
        // Parse JWT payload (middle part of token)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        this.userSubject.next({
          token,
          id: payload.userId,
          role: payload.role,
          exp: payload.exp
        });
      } catch (e) {
        console.error('Error parsing token', e);
        this.logout();
      }
    }
  }
  
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem(this.tokenKey, response.token);
          
          try {
            // Parse JWT payload
            const base64Url = response.token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            
            this.userSubject.next({
              token: response.token,
              name: response.name,
              role: response.role,
              id: payload.userId,
              exp: payload.exp
            });
          } catch (e) {
            console.error('Error parsing token', e);
          }
        })
      );
  }
  
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.userSubject.next(null);
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Check if token is expired
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expirationTime;
    } catch (e) {
      console.error('Error checking token', e);
      return false;
    }
  }
  
  isAdmin(): boolean {
    const user = this.userSubject.value;
    return user && user.role === 'admin';
  }
} 