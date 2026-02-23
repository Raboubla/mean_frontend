import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `${environment.apiUrl}/dashboard`;

    constructor(private http: HttpClient) { }

    getDashboardStats(month: number, year: number): Observable<DashboardStats> {
        const params = new HttpParams()
            .set('month', month.toString())
            .set('year', year.toString());
        return this.http.get<DashboardStats>(`${this.apiUrl}/stats`, { params });
    }
}
