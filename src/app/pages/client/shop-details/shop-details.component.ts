import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { ShopService, Shop } from '../../../services/shop-services/shop.service';
import { ProductService, Product } from '../../../services/product-services/product.service';
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
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule,
        FormsModule
    ],
    templateUrl: './shop-details.component.html',
})
export class ClientShopDetailsComponent implements OnInit {
    shop: Shop | null = null;
    products: Product[] = [];
    isLoading = true;

    searchText: string = '';
    selectedCategory: string = 'All';

    constructor(
        private route: ActivatedRoute,
        private shopService: ShopService,
        private productService: ProductService
    ) { }

    ngOnInit(): void {
        const shopId = this.route.snapshot.paramMap.get('id');
        if (shopId) {
            this.fetchShop(shopId);
            this.fetchProducts(shopId);
        } else {
            this.isLoading = false;
        }
    }

    fetchShop(id: string) {
        this.shopService.getShopById(id).subscribe({
            next: (res) => {
                this.shop = res;
                this.isLoading = false;
                if (this.shop) {
                    const bannerUrl = this.getBannerUrl(this.shop);
                    if (bannerUrl) {
                        this.extractDominantColor(bannerUrl);
                    }
                }
            },
            error: (err) => {
                console.error('Error fetching shop details', err);
                this.isLoading = false;
            }
        });
    }

    fetchProducts(shopId: string) {
        this.productService.getProductsByShop(shopId).subscribe({
            next: (res: any) => {
                this.products = res.products || [];
            },
            error: (err) => {
                console.error('Error fetching products', err);
            }
        });
    }

    get filteredProducts(): Product[] {
        return this.products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(this.searchText.toLowerCase());
            const matchesCategory = this.selectedCategory === 'All' || product.category === this.selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }

    get productCategories(): string[] {
        const categories = new Set(this.products.map(p => p.category));
        return ['All', ...Array.from(categories)];
    }

    bannerColor: string = '#333';

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

    extractDominantColor(imageUrl: string) {
        if (!imageUrl) return;

        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Draw image to a small canvas to average the colors
            canvas.width = 1;
            canvas.height = 1;
            ctx.drawImage(img, 0, 0, 1, 1);

            const pixelData = ctx.getImageData(0, 0, 1, 1).data;
            this.bannerColor = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
        };
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

    isPromotionActive(product: any): boolean {
        if (!product.promotion) return false;

        const promo = product.promotion;
        const now = new Date();
        const endDate = promo.end_date ? new Date(promo.end_date) : null;

        const hasDiscount = (promo.discount_percent && promo.discount_percent > 0) || (promo.promo_price && promo.promo_price < product.price);
        const isNotExpired = !endDate || endDate > now;

        return hasDiscount && isNotExpired;
    }

    getPromoPrice(product: any): number {
        if (!this.isPromotionActive(product)) return this.formatPrice(product.price);
        if (product.promotion.promo_price) {
            return this.formatPrice(product.promotion.promo_price);
        }
        // Calculate based on discount percent if promo_price is not set but discount is
        if (product.promotion.discount_percent) {
            const originalPrice = this.formatPrice(product.price);
            return originalPrice - (originalPrice * (product.promotion.discount_percent / 100));
        }
        return this.formatPrice(product.price);
    }

    getProductImageUrl(product: Product): string {
        if (!product.image_url) {
            return 'assets/images/products/s1.jpg'; // Placeholder
        }

        // If it's already a full URL, return it
        if (product.image_url.startsWith('http')) {
            return product.image_url;
        }

        // If it's a relative path, prepend the backend URL
        // We want 'http://localhost:5000'
        const apiUrl = environment.apiUrl;
        const baseUrl = apiUrl.replace('/api', '');

        return `${baseUrl}${product.image_url}`;
    }
}
