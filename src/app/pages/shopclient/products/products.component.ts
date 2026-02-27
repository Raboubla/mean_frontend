import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../services/product-services/product.service';
import { AppProductDialogComponent } from '../../products/product-dialog/product-dialog.component';
import { ShopService } from '../../../services/shop-services/shop.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-shop-admin-products',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './products.component.html',
})
export class AppShopAdminProductsComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ['name', 'price', 'category', 'status', 'actions'];
    dataSource: MatTableDataSource<Product>;
    isLoading = false;
    shopId: string | null = null;
    shopReady = false;

    // Filter state
    searchQuery = '';
    selectedCategory = '';

    readonly categoryOptions = [
        { value: '', label: 'All Categories' },
        { value: 'ELECTRONICS', label: 'Electronics' },
        { value: 'CLOTHING', label: 'Clothing' },
        { value: 'HOME', label: 'Home' },
        { value: 'FOOD', label: 'Food' },
        { value: 'TOYS', label: 'Toys' },
        { value: 'BEAUTY', label: 'Beauty' },
        { value: 'OTHER', label: 'Other' },
    ];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    private searchSubject = new Subject<string>();
    private destroy$ = new Subject<void>();

    constructor(
        public dialog: MatDialog,
        private productService: ProductService,
        private shopService: ShopService
    ) {
        this.dataSource = new MatTableDataSource<Product>();
    }

    ngOnInit(): void {
        this.isLoading = true;
        this.shopService.getMyShop().subscribe({
            next: (shop) => {
                if (shop && shop._id) {
                    this.shopId = shop._id;
                    this.shopReady = true;
                    this.fetchProducts();
                } else {
                    this.isLoading = false;
                }
            },
            error: (err) => {
                console.error('Failed to get shop', err);
                this.isLoading = false;
            }
        });

        this.searchSubject.pipe(
            debounceTime(350),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => this.fetchProducts());
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSearchInput(value: string): void {
        this.searchQuery = value;
        this.searchSubject.next(value);
    }

    onCategoryChange(): void {
        this.fetchProducts();
    }

    fetchProducts(): void {
        if (!this.shopId) return;

        this.isLoading = true;
        this.productService.getClientProductsByShop(
            this.shopId,
            this.searchQuery || undefined,
            this.selectedCategory || undefined
        ).subscribe({
            next: (res) => {
                this.dataSource.data = (res.products || []).map((p: any) => ({
                    ...p, price: this.formatPrice(p.price)
                }));
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.isLoading = false;
            },
            error: (err) => { console.error('Error fetching products', err); this.isLoading = false; }
        });
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
        if (!this.isPromotionActive(product)) return product.price;
        if (product.promotion.promo_price) {
            return this.formatPrice(product.promotion.promo_price);
        }
        return product.price;
    }

    openDialog(action: string, obj: any): void {
        if (!this.shopId) return;

        obj.action = action;
        obj.shop = this.shopId;
        obj.isShopAdmin = true; // Tell dialog not to show shop selection

        const dialogRef = this.dialog.open(AppProductDialogComponent, {
            data: obj,
            width: '600px',
            maxHeight: '90vh'
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.event !== 'Cancel') this.fetchProducts();
        });
    }

    deleteProduct(obj: any): void {
        if (confirm('Are you sure you want to delete ' + obj.name + '?')) {
            this.productService.deleteProduct(obj._id).subscribe({
                next: () => this.fetchProducts(),
                error: (err) => console.error('Error deleting product', err)
            });
        }
    }

    toggleStatus(obj: any): void {
        this.productService.toggleProductStatus(obj._id).subscribe({
            next: () => this.fetchProducts(),
            error: (err) => console.error('Error toggling status', err)
        });
    }
}
