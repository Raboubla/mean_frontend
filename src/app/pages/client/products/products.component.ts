import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, NgZone } from '@angular/core';
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
    selector: 'app-client-products',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './products.component.html',
})
export class ClientProductsComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('scrollSentinel') scrollSentinel!: ElementRef;

    products: Product[] = [];
    isLoading = false;
    isLoadingMore = false;
    hasMore = true;
    total = 0;

    page = 1;
    readonly limit = 10;

    searchQuery = '';
    minPrice: number | null = null; // new
    maxPrice: number | null = null; // new
    activeCategory = 'ALL';
    categories = CATEGORIES;

    private searchSubject = new Subject<string>();
    private observer!: IntersectionObserver;

    constructor(
        private productService: ProductService,
        private ngZone: NgZone
    ) { }

    ngOnInit(): void {
        this.loadProducts(true);

        // Debounce typing — only hits backend 400ms after user stops typing
        this.searchSubject.pipe(
            debounceTime(400),
            // distinctUntilChanged()
        ).subscribe(() => this.loadProducts(true));
    }

    ngAfterViewInit(): void {
        this.setupIntersectionObserver();
    }

    ngOnDestroy(): void {
        this.searchSubject.complete();
        if (this.observer) this.observer.disconnect();
    }

    // Watches the invisible div at the bottom of the list
    private setupIntersectionObserver(): void {
        this.observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && this.hasMore && !this.isLoadingMore && !this.isLoading) {
                    this.ngZone.run(() => this.loadMore());
                }
            },
            { threshold: 0.1 }
        );
        if (this.scrollSentinel?.nativeElement) {
            this.observer.observe(this.scrollSentinel.nativeElement);
        }
    }

    loadProducts(reset: boolean): void {
        if (reset) {
            this.products = [];
            this.page = 1;
            this.hasMore = true;
            this.isLoading = true;
        } else {
            this.isLoadingMore = true;
        }

        const category = this.activeCategory === 'ALL' ? undefined : this.activeCategory;
        const query = this.searchQuery.trim() || undefined;

        this.productService.getClientProducts(
            this.page,
            this.limit,
            query,
            category,
            this.minPrice ?? undefined,
            this.maxPrice ?? undefined
        ).subscribe({
            next: (res) => {
                this.products = reset ? res.products : [...this.products, ...res.products];
                this.total = res.total;
                this.hasMore = res.hasMore;
                this.isLoading = false;
                this.isLoadingMore = false;
            },
            error: (err) => {
                console.error('Error loading products', err);
                this.isLoading = false;
                this.isLoadingMore = false;
            }
        });
    }

    loadMore(): void {
        if (!this.hasMore || this.isLoadingMore || this.isLoading) return;
        this.page++;
        this.loadProducts(false);
    }

    onSearchChange(): void {
        this.searchSubject.next(this.searchQuery);
    }

    // Nouvelle méthode pour les prix
    onPriceChange(): void {
        this.searchSubject.next(`price_${this.minPrice}_${this.maxPrice}`); // On déclenche le flux de recherche
    }

    selectCategory(cat: string): void {
        if (this.activeCategory === cat) return;
        this.activeCategory = cat;
        this.loadProducts(true);
    }

    clearSearch(): void {
        this.searchQuery = '';
        this.minPrice = null;
        this.maxPrice = null;
        this.loadProducts(true);
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

    hasPromo(product: Product): boolean {
        return !!(product.promotion?.discount_percent && product.promotion.discount_percent > 0);
    }

    getPromoPrice(product: Product): number {
        const original = this.formatPrice(product.price);
        if (product.promotion?.promo_price) return this.formatPrice(product.promotion.promo_price);
        if (product.promotion?.discount_percent) {
            return original - (original * product.promotion.discount_percent / 100);
        }
        return original;
    }

    getShopName(product: Product): string {
        return typeof product.shop === 'object' && product.shop ? product.shop.name : '';
    }

    getShopId(product: Product): string {
        if (typeof product.shop === 'object' && product.shop) return product.shop._id;
        return product.shop as string || '';
    }
}
