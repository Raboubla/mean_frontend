import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips'; // Import MatChipsModule
import { ProductService, Product } from '../../../services/product-services/product.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-client-promotions',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule // Add to imports
    ],
    templateUrl: './promotions.component.html',
})
export class ClientPromotionsComponent implements OnInit {
    products: Product[] = [];
    isLoading = true;

    constructor(private productService: ProductService) { }

    ngOnInit(): void {
        this.fetchPromotionalProducts();
    }

    fetchPromotionalProducts() {
        this.productService.getPromotionalProducts().subscribe({
            next: (res: any) => {
                // Handle both array response and object with products property
                if (Array.isArray(res)) {
                    this.products = res;
                } else if (res && res.products) {
                    this.products = res.products;
                } else {
                    this.products = [];
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching promotional products', err);
                this.isLoading = false;
            }
        });
    }

    getProductImageUrl(product: Product): string {
        if (!product.image_url) {
            return 'assets/images/products/s1.jpg'; // Placeholder
        }

        if (product.image_url.startsWith('http')) {
            return product.image_url;
        }

        const apiUrl = environment.apiUrl;
        const baseUrl = apiUrl.replace('/api', '');
        return `${baseUrl}${product.image_url}`;
    }

    formatPrice(price: any): number {
        if (typeof price === 'object' && price !== null) {
            if (price.$numberDecimal) {
                return parseFloat(price.$numberDecimal);
            }
            return parseFloat(price.toString());
        }
        return Number(price);
    }

    getPromoPrice(product: any): number {
        if (!product.promotion) return this.formatPrice(product.price);

        if (product.promotion.promo_price) {
            return this.formatPrice(product.promotion.promo_price);
        }

        if (product.promotion.discount_percent) {
            const originalPrice = this.formatPrice(product.price);
            return originalPrice - (originalPrice * (product.promotion.discount_percent / 100));
        }

        return this.formatPrice(product.price);
    }

    getShopId(product: Product): string {
        if (typeof product.shop === 'string') {
            return product.shop;
        }
        return product.shop?._id || '';
    }
}
