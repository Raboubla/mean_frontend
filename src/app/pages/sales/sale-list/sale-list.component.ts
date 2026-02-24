import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { SaleService, Sale } from '../../../services/sale-services/sale-services.service';
import { ShopService } from '../../../services/shop-services/shop.service';
import { AppSaleDialogComponent } from '../sale-dialog/sale-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-sales',
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
    templateUrl: './sale-list.component.html',
})
export class AppSaleComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ['product', 'quantity', 'unit_price', 'total_price', 'shop', 'sold_at', 'actions'];
    dataSource: MatTableDataSource<Sale>;
    isLoading = false;

    // Filter state
    searchQuery = '';
    selectedShopId = '';

    // Shop dropdown data
    shops: { _id: string; name: string }[] = [];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    private searchSubject = new Subject<string>();
    private destroy$ = new Subject<void>();

    constructor(
        public dialog: MatDialog,
        private saleService: SaleService,
        private shopService: ShopService
    ) {
        this.dataSource = new MatTableDataSource<Sale>();
    }

    ngOnInit(): void {
        this.searchSubject.pipe(
            debounceTime(350),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => this.fetchSales());

        this.loadShops();
        this.fetchSales();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadShops(): void {
        this.shopService.getAllShops().subscribe({
            next: (res: any) => {
                const shops = Array.isArray(res) ? res : (res.shops || []);
                this.shops = shops.map((s: any) => ({ _id: s._id, name: s.name }));
            },
            error: (err) => console.error('Error loading shops', err)
        });
    }

    onSearchInput(value: string): void {
        this.searchQuery = value;
        this.searchSubject.next(value);
    }

    onShopChange(): void {
        this.fetchSales();
    }

    fetchSales(): void {
        this.isLoading = true;
        this.saleService.searchSales(
            this.searchQuery || undefined,
            this.selectedShopId || undefined
        ).subscribe({
            next: (res: any) => {
                const sales = Array.isArray(res) ? res : (res.sales || []);
                this.dataSource.data = sales.map((s: any) => ({
                    ...s,
                    unit_price: this.formatPrice(s.unit_price),
                    total_price: this.formatPrice(s.total_price)
                }));
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.isLoading = false;
            },
            error: (err) => { console.error('Error fetching sales', err); this.isLoading = false; }
        });
    }

    formatPrice(price: any): number {
        if (typeof price === 'object' && price !== null) {
            if (price.$numberDecimal) return parseFloat(price.$numberDecimal);
            return parseFloat(price.toString());
        }
        return Number(price);
    }

    openDialog(action: string, obj: any): void {
        obj.action = action;
        const dialogRef = this.dialog.open(AppSaleDialogComponent, {
            data: obj, width: '600px', maxHeight: '90vh'
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.event !== 'Cancel') this.fetchSales();
        });
    }

    deleteSale(obj: any): void {
        if (confirm('Are you sure you want to delete this sale?')) {
            this.saleService.deleteSale(obj._id).subscribe({
                next: () => this.fetchSales(),
                error: (err) => console.error('Error deleting sale', err)
            });
        }
    }
}
