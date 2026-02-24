import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ShopService, Shop } from '../../../services/shop-services/shop.service';
import { ProductService, Product } from '../../../services/product-services/product.service';
import { ReviewService } from '../../../services/review-services/review-services.service';
import { environment } from 'src/environments/environment';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
        FormsModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './shop-details.component.html',
})
export class ClientShopDetailsComponent implements OnInit, OnDestroy {
    shop: Shop | null = null;
    allProducts: Product[] = [];   // full list (for category dropdown)
    products: Product[] = [];   // displayed (filtered) list
    isLoading = true;
    isLoadingProds = false;

    // Approved reviews (3 random)
    displayedReviews: any[] = [];

    searchText = '';
    selectedCategory = 'All';
    shopId = '';

    private searchSubject = new Subject<string>();

    constructor(
        private route: ActivatedRoute,
        private shopService: ShopService,
        private productService: ProductService,
        private reviewService: ReviewService
    ) { }

    ngOnInit(): void {
        this.shopId = this.route.snapshot.paramMap.get('id') || '';
        if (this.shopId) {
            this.fetchShop(this.shopId);
            this.fetchProducts();
            this.fetchApprovedReviews();
        } else {
            this.isLoading = false;
        }

        // Debounce text search — calls backend 400ms after typing stops
        this.searchSubject.pipe(
            debounceTime(400),
            distinctUntilChanged()
        ).subscribe(() => this.fetchProducts());
    }

    ngOnDestroy(): void {
        this.searchSubject.complete();
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

    fetchProducts(): void {
        if (!this.shopId) return;
        this.isLoadingProds = true;
        this.productService.getClientProductsByShop(
            this.shopId,
            this.searchText.trim() || undefined,
            this.selectedCategory !== 'All' ? this.selectedCategory : undefined
        ).subscribe({
            next: (res: any) => {
                this.products = res.products || [];
                // Populate category dropdown from the initial full load
                if (!this.searchText && this.selectedCategory === 'All') {
                    this.allProducts = this.products;
                }
                this.isLoadingProds = false;
            },
            error: (err) => {
                console.error('Error fetching products', err);
                this.isLoadingProds = false;
            }
        });
    }

    onSearchChange(): void { this.searchSubject.next(this.searchText); }
    onCategoryChange(): void { this.fetchProducts(); }

    get productCategories(): string[] {
        const cats = new Set(this.allProducts.map(p => p.category));
        return ['All', ...Array.from(cats)];
    }

    fetchApprovedReviews(): void {
        this.reviewService.getApprovedReviewsByShop(this.shopId).subscribe({
            next: (res: any) => {
                const all: any[] = res.reviews || [];
                // Fisher-Yates shuffle
                for (let i = all.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [all[i], all[j]] = [all[j], all[i]];
                }
                this.displayedReviews = all.slice(0, 3);
            },
            error: (err) => console.error('Reviews error', err)
        });
    }

    starsArray(n: number): number[] { return Array(n).fill(0); }

    // ──────────── Review form ────────────
    showReviewForm = false;
    reviewLoading = false;
    reviewSuccess = false;
    reviewError = '';

    reviewForm = {
        customer_name: '',
        rating: 0,
        comment: ''
    };

    stars = [1, 2, 3, 4, 5];

    setRating(n: number): void { this.reviewForm.rating = n; }

    toggleReviewForm(): void {
        this.showReviewForm = !this.showReviewForm;
        this.reviewSuccess = false;
        this.reviewError = '';
    }

    submitReview(): void {
        if (!this.reviewForm.customer_name.trim() || !this.reviewForm.rating) {
            this.reviewError = 'Please fill in your name and select a rating.';
            return;
        }
        this.reviewLoading = true;
        this.reviewError = '';
        this.reviewService.createReview({
            ...this.reviewForm,
            shop: this.shopId
        }).subscribe({
            next: () => {
                this.reviewSuccess = true;
                this.reviewLoading = false;
                this.reviewForm = { customer_name: '', rating: 0, comment: '' };
            },
            error: (err) => {
                this.reviewError = err.error?.message || 'Failed to submit review. Please try again.';
                this.reviewLoading = false;
            }
        });
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
