import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // the url on environment
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }
  // sign up
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }


  // sign in
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {

        if (!response.token) {
          throw new Error("Token manquant");
        }

        // ❌ Si ce n'est pas ADMIN → erreur
        if (response.role !== 'ADMIN') {
          throw new Error("Erreur de profil");
        }

        // Si ADMIN
        const decodedToken: any = jwtDecode(response.token);

        this.saveToken(response.token);
        this.saveRole(response.role);
        this.saveId(decodedToken.id);
      })
    );
  }

  // sign in
  loginShop(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {

        if (!response.token) {
          throw new Error("Token manquant");
        }

        // Si ce n'est pas SHOP_ADMIN → erreur
        if (response.role !== 'SHOP_ADMIN') {
          throw new Error("Erreur de profil");
        }

        // Si SHOP_ADMIN
        const decodedToken: any = jwtDecode(response.token);

        this.saveToken(response.token);
        this.saveRole(response.role);
        this.saveId(decodedToken.id);
      })
    );
  }
  private saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  private saveRole(role: string) {
    localStorage.setItem('role', role);
  }

  private saveId(id: string) {
    localStorage.setItem('id', id);
  }
  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.clear();
  }
}
