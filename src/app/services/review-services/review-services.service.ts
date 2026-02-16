import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Review {
  _id?: string;
  customer_name: string;
  rating: number; // 1-5
  comment?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  shop: string | { _id: string; name: string };
  created_at?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) { }

  // ==================== BASIC CRUD ====================

  createReview(reviewData: any): Observable<any> {
    return this.http.post(this.apiUrl, reviewData);
  }

  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.apiUrl);
  }

  getReviewById(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/${id}`);
  }

  updateReview(id: string, reviewData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, reviewData);
  }

  deleteReview(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ==================== UTILITY FUNCTIONS ====================

  getReviewsByShop(shopId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/shop/${shopId}`);
  }

  getApprovedReviewsByShop(shopId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/shop/${shopId}/approved`);
  }

  getReviewsByStatus(status: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/status/${status}`);
  }

  getReviewsByRating(rating: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/rating/${rating}`);
  }

  updateReviewStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }

  getReviewStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/overview`);
  }

  getReviewStatsByShop(shopId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/shop/${shopId}`);
  }

  getTopRatedShops(limit: number = 10): Observable<any[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any[]>(`${this.apiUrl}/analytics/top-rated`, { params });
  }
}
