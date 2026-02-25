import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductService, Product } from '../../../services/product-services/product.service';
import { environment } from 'src/environments/environment';

const CATEGORIES = ['ALL', 'ELECTRONICS', 'CLOTHING', 'HOME', 'FOOD', 'TOYS', 'BEAUTY', 'OTHER'];

@Component({
    selector: 'app-client-promotions',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './promotions.component.html',
})
export class ClientPromotionsComponent implements OnInit, OnDestroy {
    products: Product[] = [];
    isLoading = true;
    total = 0;

    searchQuery = '';
    activeCategory = 'ALL';
    categories = CATEGORIES;

    minPrice: number | null = null;
    maxPrice: number | null = null;

    private searchSubject = new Subject<string>();

    constructor(private productService: ProductService) { }

    ngOnInit(): void {
        this.loadPromotions();

        this.searchSubject.pipe(
            debounceTime(400),
            // distinctUntilChanged()
        ).subscribe(() => this.loadPromotions());
    }

    ngOnDestroy(): void {
        this.searchSubject.complete();
    }

    onPriceChange(): void {
        this.searchSubject.next(`price_update_${this.minPrice}_${this.maxPrice}`);
    }

    loadPromotions(): void {
        this.isLoading = true;
        const category = this.activeCategory === 'ALL' ? undefined : this.activeCategory;
        const query = this.searchQuery.trim() || undefined;

        this.productService.getClientPromotions(query, category, this.minPrice ?? undefined,
            this.maxPrice ?? undefined).subscribe({
                next: (res) => {
                    this.products = res.products;
                    this.total = res.count;
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Error loading promotions', err);
                    this.isLoading = false;
                }
            });
    }

    onSearchChange(): void {
        this.searchSubject.next(this.searchQuery);
    }

    selectCategory(cat: string): void {
        if (this.activeCategory === cat) return;
        this.activeCategory = cat;
        this.loadPromotions();
    }

    clearSearch(): void {
        this.searchQuery = '';
        this.loadPromotions();
    }

    getImageUrl(product: Product): string {
        if (!product.image_url) return 'assets/images/products/s1.jpg';
        if (product.image_url.startsWith('http')) return product.image_url;
        return `${environment.apiUrl.replace('/api', '')}${product.image_url}`;
    }

    formatPrice(price: any): number {
        if (typeof price === 'object' && price !== null) {
            return parseFloat(price.$numberDecimal ?? price.toString());
        }
        return Number(price);
    }

    getPromoPrice(product: Product): number {
        const original = this.formatPrice(product.price);
        if (product.promotion?.promo_price) return this.formatPrice(product.promotion.promo_price);
        if (product.promotion?.discount_percent) {
            return original - (original * product.promotion.discount_percent / 100);
        }
        return original;
    }

    getShopId(product: Product): string {
        if (typeof product.shop === 'object' && product.shop) return product.shop._id;
        return product.shop as string || '';
    }

    getShopName(product: Product): string {
        return typeof product.shop === 'object' && product.shop ? product.shop.name : '';
    }
}
