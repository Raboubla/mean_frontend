import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { ShopService, Shop } from '../../../services/shop-services/shop.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-client-shop-details',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatCardModule
    ],
    templateUrl: './shop-details.component.html',
})
export class ClientShopDetailsComponent implements OnInit {
    shop: Shop | null = null;
    isLoading = true;

    constructor(
        private route: ActivatedRoute,
        private shopService: ShopService
    ) { }

    ngOnInit(): void {
        const shopId = this.route.snapshot.paramMap.get('id');
        if (shopId) {
            this.fetchShop(shopId);
        } else {
            this.isLoading = false;
        }
    }

    fetchShop(id: string) {
        this.shopService.getShopById(id).subscribe({
            next: (res) => {
                this.shop = res;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching shop details', err);
                this.isLoading = false;
            }
        });
    }

    getBannerUrl(shop: Shop): string {
        if (!shop.banner_url) {
            return ''; // Or a default placeholder if you want
        }

        if (shop.banner_url.startsWith('http')) {
            return shop.banner_url;
        }

        const apiUrl = environment.apiUrl;
        const baseUrl = apiUrl.replace('/api', '');
        return `${baseUrl}${shop.banner_url}`;
    }
}
