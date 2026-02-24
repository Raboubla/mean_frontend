import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  _id: string;
  email: string;
  role: 'ADMIN' | 'BUYER' | 'SHOP_ADMIN';
  permission: ('CASHIER' | 'MASCOT' | 'SELLER' | 'RECEPTIONIST' | 'ADMIN')[];
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'PENDING';
  shop?: {
    _id: string;
    name: string;
    category: string;
    floor: string;
  };
  created_at?: Date;
  // Optional password only for creation
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // L'URL
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  // ==================== BASIC CRUD ====================

  // Crée un nouvel utilisateur (POST /api/users)
  createUser(userData: any): Observable<any> {
    return this.http.post(this.apiUrl, userData);
  }

  // Récupère tous les utilisateurs (GET /api/users) - ADMIN ONLY
  getAllUsers(): Observable<{ count: number; users: User[] }> {
    return this.http.get<{ count: number; users: User[] }>(this.apiUrl);
  }

  // Recherche backend avec filtres combinés (query + status + role)
  searchUsers(query?: string, status?: string, role?: string): Observable<{ count: number; users: User[] }> {
    let params = new HttpParams();
    if (query) params = params.set('query', query);
    if (status) params = params.set('status', status);
    if (role) params = params.set('role', role);
    return this.http.get<{ count: number; users: User[] }>(this.apiUrl, { params });
  }


  // Récupère un utilisateur par ID (GET /api/users/{id})
  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Met à jour un utilisateur (PUT /api/users/{id})
  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, userData);
  }

  // Supprime un utilisateur (DELETE /api/users/{id})
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ==================== UTILITY FUNCTIONS ====================

  // Récupère les utilisateurs par rôle (GET /api/users/role/{role})
  getUsersByRole(role: 'ADMIN' | 'BUYERS' | 'ADMINSHOP'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/role/${role}`);
  }

  // Récupère les utilisateurs d'une boutique (GET /api/users/shop/{shopId})
  getUsersByShop(shopId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/shop/${shopId}`);
  }

  // Basculer le statut ACTIVE/INACTIVE (PATCH /api/users/{id}/toggle-status)
  toggleStatus(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  // Changer le mot de passe (PATCH /api/users/{id}/password)
  updatePassword(id: string, passwords: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/password`, passwords);
  }

  // Statistiques globales (GET /api/users/stats/overview)
  getStatsOverview(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/overview`);
  }

  // Recherche par email (GET /api/users/search/email?query=john)
  searchByEmail(query: string): Observable<any[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<any[]>(`${this.apiUrl}/search/email`, { params });
  }
}
