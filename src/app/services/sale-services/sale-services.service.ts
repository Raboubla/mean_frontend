import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Sale {
  _id?: string;
  product: string | { _id: string; name: string }; // ID or populated object
  quantity: number;
  unit_price: number; // Decimal128 handled as number/string in frontend usually
  total_price: number; // Decimal128
  sold_at?: Date;
  shop: string | { _id: string; name: string }; // ID or populated object
}

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private apiUrl = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) { }

  // ==================== BASIC CRUD ====================

  createSale(saleData: any): Observable<any> {
    return this.http.post(this.apiUrl, saleData);
  }

  getAllSales(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Admin: backend search by product name + optional shopId filter
  searchSales(query?: string, shopId?: string): Observable<any> {
    let params = new HttpParams();
    if (query) params = params.set('query', query);
    if (shopId) params = params.set('shopId', shopId);
    return this.http.get<any>(this.apiUrl, { params });
  }

  getSaleById(id: string): Observable<Sale> {
    return this.http.get<Sale>(`${this.apiUrl}/${id}`);
  }

  updateSale(id: string, saleData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, saleData);
  }

  deleteSale(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ==================== UTILITY FUNCTIONS ====================

  getSalesByShop(shopId: string): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${this.apiUrl}/shop/${shopId}`);
  }

  getSalesByDateRange(startDate: string, endDate: string): Observable<Sale[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<Sale[]>(`${this.apiUrl}/filter/date-range`, { params });
  }

  getTodaySales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${this.apiUrl}/filter/today`);
  }

  getSalesStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/overview`);
  }

  getSalesStatsByShop(shopId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/shop/${shopId}`);
  }

  getRevenueByDateRange(startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get(`${this.apiUrl}/revenue/date-range`, { params });
  }

  getTopSellingShops(limit: number = 10): Observable<any[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any[]>(`${this.apiUrl}/analytics/top-shops`, { params });
  }
}
