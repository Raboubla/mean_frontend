import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OpeningHour {
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  open: string;
  close: string;
}

export interface Shop {
  _id: string;
  name: string;
  category: ('FASHION' | 'FOOD' | 'ELECTRONICS' | 'LEISURE' | 'RESTAURANT' | 'BEAUTY')[];
  description?: string;
  status: 'OPEN' | 'CLOSED' | 'UNDER_RENOVATION' | 'COMING_SOON';
  floor: number;
  view_count: number;
  opening_hours: OpeningHour[];
}

// @Injectable({
//   providedIn: 'root'
// })
// export class ShopService {
//   private apiUrl = `${environment.apiUrl}/shops`;

//   constructor(private http: HttpClient) { }

//   // ==================== BASIC CRUD ====================

//   createShop(shopData: any): Observable<any> {
//     return this.http.post(this.apiUrl, shopData);
//   }

//   getAllShops(): Observable<Shop[]> {
//     return this.http.get<Shop[]>(this.apiUrl);
//   }

//   getShopById(id: string): Observable<Shop> {
//     return this.http.get<Shop>(`${this.apiUrl}/${id}`);
//   }

//   updateShop(id: string, shopData: any): Observable<any> {
//     return this.http.put(`${this.apiUrl}/${id}`, shopData);
//   }

//   deleteShop(id: string): Observable<any> {
//     return this.http.delete(`${this.apiUrl}/${id}`);
//   }

//   // ==================== UTILITY FUNCTIONS ====================

//   getShopsByCategory(category: string): Observable<Shop[]> {
//     return this.http.get<Shop[]>(`${this.apiUrl}/category/${category}`);
//   }

//   getShopsByStatus(status: string): Observable<Shop[]> {
//     return this.http.get<Shop[]>(`${this.apiUrl}/status/${status}`);
//   }

//   getShopsByFloor(floor: number): Observable<Shop[]> {
//     return this.http.get<Shop[]>(`${this.apiUrl}/floor/${floor}`);
//   }

//   updateShopStatus(id: string, status: string): Observable<any> {
//     return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
//   }

//   searchShopsByName(query: string): Observable<Shop[]> {
//     const params = new HttpParams().set('query', query);
//     return this.http.get<Shop[]>(`${this.apiUrl}/search/name`, { params });
//   }

//   getShopStatistics(): Observable<any> {
//     return this.http.get(`${this.apiUrl}/stats/overview`);
//   }

//   getMostViewedShops(limit: number = 10): Observable<Shop[]> {
//     const params = new HttpParams().set('limit', limit.toString());
//     return this.http.get<Shop[]>(`${this.apiUrl}/analytics/most-viewed`, { params });
//   }

//   getShopsOpenNow(): Observable<Shop[]> {
//     return this.http.get<Shop[]>(`${this.apiUrl}/filter/open-now`);
//   }

//   // In ShopService class
//   getMyShop(): Observable<Shop | null> {
//     return this.http.get<Shop | null>(`${this.apiUrl}/my`);
//   }

//   private getAuthHeaders() {
//   const token = localStorage.getItem('token');
//   return { Authorization: `Bearer ${token}` };
// }

// getMyShop(): Observable<Shop | null> {
//   return this.http.get<Shop | null>(`${this.apiUrl}/my`, { headers: this.getAuthHeaders() });
// }


// }

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private apiUrl = `${environment.apiUrl}/shops`;

  constructor(private http: HttpClient) { }

  // ==================== AUTH HELPERS ====================
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  }

  // ==================== BASIC CRUD ====================
  createShop(shopData: any): Observable<any> {
    return this.http.post(this.apiUrl, shopData, { headers: this.getAuthHeaders() });
  }

  getAllShops(): Observable<Shop[]> {
    return this.http.get<Shop[]>(this.apiUrl);
  }

  getShopById(id: string): Observable<Shop> {
    return this.http.get<Shop>(`${this.apiUrl}/${id}`);
  }

  updateShop(id: string, shopData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, shopData, { headers: this.getAuthHeaders() });
  }

  deleteShop(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // ==================== UTILITY FUNCTIONS ====================
  getShopsByCategory(category: string): Observable<Shop[]> {
    return this.http.get<Shop[]>(`${this.apiUrl}/category/${category}`);
  }

  getShopsByStatus(status: string): Observable<Shop[]> {
    return this.http.get<Shop[]>(`${this.apiUrl}/status/${status}`);
  }

  getShopsByFloor(floor: number): Observable<Shop[]> {
    return this.http.get<Shop[]>(`${this.apiUrl}/floor/${floor}`);
  }

  updateShopStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status }, { headers: this.getAuthHeaders() });
  }

  searchShopsByName(query: string): Observable<Shop[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Shop[]>(`${this.apiUrl}/search/name`, { params });
  }

  getShopStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats/overview`, { headers: this.getAuthHeaders() });
  }

  getMostViewedShops(limit: number = 10): Observable<Shop[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<Shop[]>(`${this.apiUrl}/analytics/most-viewed`, { params });
  }

  getShopsOpenNow(): Observable<Shop[]> {
    return this.http.get<Shop[]>(`${this.apiUrl}/filter/open-now`);
  }

  // ==================== SHOP DASHBOARD ====================
  getMyShop(): Observable<Shop | null> {
  const token = localStorage.getItem('token');
  return this.http.get<Shop | null>(`${this.apiUrl}/my`, {
    headers: { Authorization: `Bearer ${token}` }
    });
  }

}

