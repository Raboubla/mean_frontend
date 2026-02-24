import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../services/product-services/product.service';
import { AppProductDialogComponent } from '../product-dialog/product-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatCardModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './product-list.component.html',
})
export class AppProductComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ['name', 'price', 'category', 'shop', 'status', 'actions'];
    dataSource: MatTableDataSource<Product>;
    isLoading = false;

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

    constructor(public dialog: MatDialog, private productService: ProductService) {
        this.dataSource = new MatTableDataSource<Product>();
    }

    ngOnInit(): void {
        this.searchSubject.pipe(
            debounceTime(350),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => this.fetchProducts());
        this.fetchProducts();
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
        this.isLoading = true;
        this.productService.searchAdminProducts(
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
            // Handle Mongoose Decimal128 { $numberDecimal: "..." }
            if (price.$numberDecimal) {
                return parseFloat(price.$numberDecimal);
            }
            // Handle if custom toJSON wasn't used and it's some other object structure, check toString
            return parseFloat(price.toString());
        }
        return Number(price);
    }

    isPromotionActive(product: any): boolean {
        if (!product.promotion) return false;

        const promo = product.promotion;
        const now = new Date();
        const endDate = promo.end_date ? new Date(promo.end_date) : null;

        // Active if:
        // 1. Has discount or promo price
        // 2. End date is not set OR end date is in the future
        const hasDiscount = (promo.discount_percent && promo.discount_percent > 0) || (promo.promo_price && promo.promo_price < product.price);
        const isNotExpired = !endDate || endDate > now;

        return hasDiscount && isNotExpired;
    }

    getPromoPrice(product: any): number {
        if (!this.isPromotionActive(product)) return product.price;
        // If promo_price is explicitly set, use it. Otherwise calculate from discount.
        // Note: backend usually handles this, but here we prioritize what's available.
        if (product.promotion.promo_price) {
            return this.formatPrice(product.promotion.promo_price);
        }
        return product.price; // Fallback
    }




    openDialog(action: string, obj: any): void {
        obj.action = action;
        const dialogRef = this.dialog.open(AppProductDialogComponent, {
            data: obj,
            width: '600px',
            maxHeight: '90vh'
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.event !== 'Cancel') this.fetchProducts();
        });
    }

    deleteProduct(obj: any) {
        if (confirm('Are you sure you want to delete ' + obj.name + '?')) {
            this.productService.deleteProduct(obj._id).subscribe({
                next: () => this.fetchProducts(),
                error: (err) => console.error('Error deleting product', err)
            });
        }
    }

    toggleStatus(obj: any) {
        this.productService.toggleProductStatus(obj._id).subscribe({
            next: () => this.fetchProducts(),
            error: (err) => console.error('Error toggling status', err)
        });
    }
}
