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
        this.productService.getAllProducts(1, 1000).subscribe({ // Fetch meaningful amount
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

    onPageChange(event: PageEvent) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadProducts();
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;

        if (filterValue) {
            this.productService.searchProducts(filterValue).subscribe({
                next: (products) => {
                    this.dataSource.data = products.map(p => ({
                        ...p,
                        price: this.formatPrice(p.price)
                    }));
                    this.totalProducts = products.length; // Approximate
                }
            });
        } else {
            this.loadProducts();
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
