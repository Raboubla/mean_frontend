import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Promotion {
    discount_percent?: number;
    promo_price?: number; // Represented as number for frontend
    end_date?: Date;
}

export interface Product {
    _id: string;
    name: string;
    description?: string;
    price: number; // Represented as number for frontend (Decimal128 from backend)
    category: 'ELECTRONICS' | 'CLOTHING' | 'HOME' | 'FOOD' | 'TOYS' | 'BEAUTY' | 'OTHER';
    status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED' | 'PRE_ORDER';
    is_active: boolean;
    shop: string | { _id: string; name: string }; // ID or populated object
    promotion?: Promotion;
    image_url: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = `${environment.apiUrl}/products`;

    constructor(private http: HttpClient) { }

    // ==================== BASIC CRUD ====================

    createProduct(productData: any): Observable<any> {
        return this.http.post(this.apiUrl, productData);
    }

    getAllProducts(): Observable<{ products: Product[], count: number }> {
        return this.http.get<{ products: Product[], count: number }>(this.apiUrl);
    }

    // Client-facing: search + category + infinite scroll pagination
    getClientProducts(page: number = 1, limit: number = 10, query?: string, category?: string): Observable<{
        products: Product[]; total: number; pages: number; hasMore: boolean; count: number;
    }> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());
        if (query) params = params.set('query', query);
        if (category) params = params.set('category', category);
        return this.http.get<{ products: Product[]; total: number; pages: number; hasMore: boolean; count: number }>(
            `${this.apiUrl}/client`, { params }
        );
    }

    getProductById(id: string): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`);
    }

    updateProduct(id: string, productData: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, productData);
    }

    deleteProduct(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    // ==================== UTILITY FUNCTIONS ====================

    getProductsByShop(shopId: string): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/shop/${shopId}`);
    }

    searchProducts(query: string): Observable<Product[]> {
        const params = new HttpParams().set('query', query);
        return this.http.get<Product[]>(`${this.apiUrl}/search/query`, { params });
    }

    getProductsByStatus(status: string): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/status/${status}`);
    }

    getPromotionalProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/filter/promotions`);
    }

    // Client-facing promotions: search + category filter
    getClientPromotions(query?: string, category?: string): Observable<{ products: Product[], count: number }> {
        let params = new HttpParams();
        if (query) params = params.set('query', query);
        if (category) params = params.set('category', category);
        return this.http.get<{ products: Product[], count: number }>(`${this.apiUrl}/client/promotions`, { params });
    }

    toggleProductStatus(id: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}/toggle-status`, {});
    }

    getProductStatsByShop(shopId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/stats/shop/${shopId}`);
    }

    getProductsByCategory(category: string): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/category/${category}`);
    }
}
