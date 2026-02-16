import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { SaleService, Sale } from '../../../services/sale-services/sale-services.service';
import { AppSaleDialogComponent } from '../sale-dialog/sale-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-sales',
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
    templateUrl: './sale-list.component.html',
})
export class AppSaleComponent implements OnInit {
    displayedColumns: string[] = ['product', 'quantity', 'unit_price', 'total_price', 'shop', 'sold_at', 'actions'];
    dataSource: MatTableDataSource<Sale>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(public dialog: MatDialog, private saleService: SaleService) {
        this.dataSource = new MatTableDataSource<Sale>();
    }

    ngOnInit(): void {
        this.loadSales();
    }

    loadSales() {
        this.saleService.getAllSales().subscribe({
            next: (res: any) => {
                // Handle response structure. Assuming array for client-side pagination as per request to match other lists
                // If API returns { sales: [], ... }, adjust accordingly.
                const sales = Array.isArray(res) ? res : (res.sales || []);

                this.dataSource.data = sales.map((s: any) => ({
                    ...s,
                    unit_price: this.formatPrice(s.unit_price),
                    total_price: this.formatPrice(s.total_price)
                }));

                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            error: (err) => console.error('Error fetching sales', err)
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

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    openDialog(action: string, obj: any): void {
        obj.action = action;
        const dialogRef = this.dialog.open(AppSaleDialogComponent, {
            data: obj,
            width: '600px',
            maxHeight: '90vh'
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.event !== 'Cancel') {
                this.loadSales();
            }
        });
    }

    deleteSale(obj: any) {
        if (confirm('Are you sure you want to delete this sale?')) {
            this.saleService.deleteSale(obj._id).subscribe({
                next: () => this.loadSales(),
                error: (err) => console.error('Error deleting sale', err)
            });
        }
    }
}
