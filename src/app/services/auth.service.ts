import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // L'URL vient de l'environnement
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }
  // Inscription
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }
  // Connexion
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          this.saveToken(response.token);
          this.saveRole(response.user.role);
        }
      })
    );
  }

  // // Connexion sécurisée
  // login(credentials: any): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
  //     tap((response: any) => {
  //       // On vérifie que la réponse et l'utilisateur existent bien
  //       if (response && response.token && response.user) {
  //         this.saveToken(response.token);
  //         this.saveRole(response.user.role);
  //       }
  //     })
  //   );
  // }
  // Gestion du stockage local
  private saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  private saveRole(role: string) {
    localStorage.setItem('role', role);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.clear();
  }
}
