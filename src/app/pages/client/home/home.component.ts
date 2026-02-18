import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { ShopService, Shop } from '../../../services/shop-services/shop.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-client-home',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        RouterModule,
        MatCardModule
    ],
    templateUrl: './home.component.html',
})
export class ClientHomeComponent implements OnInit {
    shops: Shop[] = [];
    isLoading = true;

    constructor(private shopService: ShopService) { }

    ngOnInit(): void {
        this.fetchShops();
    }

    fetchShops() {
        this.shopService.getAllShops().subscribe({
            next: (res: any) => {
                this.shops = Array.isArray(res) ? res : (res.shops || []);
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching shops', err);
                this.isLoading = false;
            }
        });
    }

    getBannerUrl(shop: Shop): string {
        if (!shop.banner_url) {
            return 'assets/images/products/s1.jpg'; // Placeholder
        }

        // If it's already a full URL, return it
        if (shop.banner_url.startsWith('http')) {
            return shop.banner_url;
        }

        // If it's a relative path, prepend the backend URL
        // We want 'http://localhost:5000'
        const apiUrl = environment.apiUrl;
        const baseUrl = apiUrl.replace('/api', '');

        return `${baseUrl}${shop.banner_url}`;
    }
}
