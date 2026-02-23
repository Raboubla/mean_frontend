import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ProductService, Product } from '../../../services/product-services/product.service';
import { AppProductDialogComponent } from '../product-dialog/product-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatCardModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule
    ],
    templateUrl: './product-list.component.html',
})
export class AppProductComponent implements OnInit {
    displayedColumns: string[] = ['name', 'price', 'category', 'shop', 'status', 'actions'];
    dataSource: MatTableDataSource<Product>;
    totalProducts = 0;
    pageSize = 10;
    pageIndex = 0;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(public dialog: MatDialog, private productService: ProductService) {
        this.dataSource = new MatTableDataSource<Product>();
    }

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts() {
        this.productService.getAllProducts().subscribe({ // Fetch all products for admin table
            next: (res: any) => {
                // Check structure: { products: [], total: ... } OR just []
                const products = res.products || res;
                this.dataSource.data = Array.isArray(products) ? products.map((p: any) => ({
                    ...p,
                    price: this.formatPrice(p.price)
                })) : [];

                // Client-side pagination
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.totalProducts = this.dataSource.data.length;
            },
            error: (err) => console.error('Error fetching products', err)
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


    onPageChange(event: PageEvent) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadProducts();
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    openDialog(action: string, obj: any): void {
        obj.action = action;
        const dialogRef = this.dialog.open(AppProductDialogComponent, {
            data: obj,
            width: '600px',
            maxHeight: '90vh'
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.event !== 'Cancel') {
                this.loadProducts();
            }
        });
    }

    deleteProduct(obj: any) {
        if (confirm('Are you sure you want to delete ' + obj.name + '?')) {
            this.productService.deleteProduct(obj._id).subscribe({
                next: () => this.loadProducts(),
                error: (err) => console.error('Error deleting product', err)
            });
        }
    }

    toggleStatus(obj: any) {
        this.productService.toggleProductStatus(obj._id).subscribe({
            next: () => this.loadProducts(), // Reload to see status change
            error: (err) => console.error('Error toggling status', err)
        });
    }
}
