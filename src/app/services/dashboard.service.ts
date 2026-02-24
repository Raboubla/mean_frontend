import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface DashboardStats {
    month: number;
    year: number;
    stats: {
        users: number;
        shops: number;
        products: number;
        sales: number;
        communications: number;
        reviews: number;
    };
}

export interface TopShopByViews {
    _id: string;
    name: string;
    view_count: number;
    category?: string[];
    status?: string;
}

export interface TopShopByProducts {
    shopId: string;
    shopName: string;
    productCount: number;
}

export interface TopProductBySales {
    productId: string;
    productName: string;
    category: string;
    totalQty: number;
    totalRevenue: number;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `${environment.apiUrl}/dashboard`;
    private shopsUrl = `${environment.apiUrl}/shops`;

    constructor(private http: HttpClient) { }

    getDashboardStats(month: number, year: number): Observable<DashboardStats> {
        const params = new HttpParams()
            .set('month', month.toString())
            .set('year', year.toString());
        return this.http.get<DashboardStats>(`${this.apiUrl}/stats`, { params });
    }

    // Top 3 shops by view_count — response is { count, shops: [] }
    getTopShopsByViews(limit: number = 3): Observable<TopShopByViews[]> {
        const params = new HttpParams().set('limit', limit.toString());
        return this.http.get<{ count: number; shops: TopShopByViews[] }>(
            `${this.shopsUrl}/analytics/most-viewed`, { params }
        ).pipe(map(res => res.shops));
    }

    // Top 5 shops by product count — new dashboard endpoint
    getTopShopsByProducts(limit: number = 5): Observable<TopShopByProducts[]> {
        const params = new HttpParams().set('limit', limit.toString());
        return this.http.get<TopShopByProducts[]>(`${this.apiUrl}/top-shops-by-products`, { params });
    }

    // Top 5 products by total sales quantity — new dashboard endpoint
    getTopProductsBySales(limit: number = 5): Observable<TopProductBySales[]> {
        const params = new HttpParams().set('limit', limit.toString());
        return this.http.get<TopProductBySales[]>(`${this.apiUrl}/top-products-by-sales`, { params });
    }
}
