import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Communication {
  _id?: string;
  title: string;
  content: string;
  type: 'ANNOUNCEMENT' | 'EVENT';
  target: 'ALL' | 'BUYERS' | 'SHOP_ADMINS';
  start_date: Date;
  end_date: Date;
  image_url?: string;
  shop?: string | { _id: string; name: string };
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private apiUrl = `${environment.apiUrl}/communications`;

  constructor(private http: HttpClient) { }

  // ==================== BASIC CRUD ====================

  createCommunication(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getAllCommunications(): Observable<Communication[]> {
    return this.http.get<Communication[]>(this.apiUrl);
  }

  getCommunicationById(id: string): Observable<Communication> {
    return this.http.get<Communication>(`${this.apiUrl}/${id}`);
  }

  updateCommunication(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteCommunication(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ==================== UTILITY FUNCTIONS ====================

  getActiveCommunications(): Observable<Communication[]> {
    return this.http.get<Communication[]>(`${this.apiUrl}/filter/active`);
  }

  getCommunicationsByType(type: string): Observable<Communication[]> {
    return this.http.get<Communication[]>(`${this.apiUrl}/type/${type}`);
  }

  getCommunicationsByTarget(target: string): Observable<Communication[]> {
    return this.http.get<Communication[]>(`${this.apiUrl}/target/${target}`);
  }

  getCommunicationsByShop(shopId: string): Observable<Communication[]> {
    return this.http.get<Communication[]>(`${this.apiUrl}/shop/${shopId}`);
  }

  getUpcomingCommunications(): Observable<Communication[]> {
    return this.http.get<Communication[]>(`${this.apiUrl}/filter/upcoming`);
  }

  getExpiredCommunications(): Observable<Communication[]> {
    return this.http.get<Communication[]>(`${this.apiUrl}/filter/expired`);
  }

  getCommunicationStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/overview`);
  }

  searchCommunications(query: string): Observable<Communication[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Communication[]>(`${this.apiUrl}/search/query`, { params });
  }
}
