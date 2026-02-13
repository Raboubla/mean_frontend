import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ShopService, Shop } from '../../../services/shop-services/shop.service';
import { AppShopDialogComponent } from '../shop-dialog/shop-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-shops',
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
    templateUrl: './shop-list.component.html',
})
export class AppShopComponent implements OnInit {
    displayedColumns: string[] = ['name', 'category', 'status', 'floor', 'views', 'actions'];
    dataSource: MatTableDataSource<Shop>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(public dialog: MatDialog, private shopService: ShopService) {
        this.dataSource = new MatTableDataSource<Shop>();
    }

    ngOnInit(): void {
        this.loadShops();
    }

    loadShops() {
        this.shopService.getAllShops().subscribe({
            next: (res: any) => {
                this.dataSource.data = res.shops;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            error: (err) => console.error('Error fetching shops', err)
        });
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
        const dialogRef = this.dialog.open(AppShopDialogComponent, {
            data: obj,
            width: '600px', // Set a width for better layout
            maxHeight: '90vh'
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.event !== 'Cancel') {
                // Improve: Instead of full reload, update local data source if optimized
                this.loadShops();
            }
        });
    }

    deleteShop(obj: any) {
        if (confirm('Are you sure you want to delete ' + obj.name + '?')) {
            this.shopService.deleteShop(obj._id).subscribe({
                next: () => this.loadShops(),
                error: (err) => console.error('Error deleting shop', err)
            });
        }
    }

    toggleStatus(obj: any) {
        // Current status
        const currentStatus = obj.status;
        let newStatus = 'OPEN';
        if (currentStatus === 'OPEN') newStatus = 'CLOSED'; // Simple toggle or rotate? Let's rotate or just simple toggle for now, or maybe a menu?

        // User requested "implement like users", users have toggle active/inactive.
        // Shops have 4 statuses. A simple toggle might not be enough.
        // For now, let's open the dialog to change status properly, OR cycle OPEN/CLOSED.
        // Let's implement a cycle for quick action: OPEN -> CLOSED -> OPEN.

        if (currentStatus === 'OPEN') newStatus = 'CLOSED';
        else if (currentStatus === 'CLOSED') newStatus = 'OPEN';
        else newStatus = 'OPEN'; // Reset to open if renovation etc.

        this.shopService.updateShopStatus(obj._id, newStatus).subscribe({
            next: () => this.loadShops(),
            error: (err) => console.error('Error updating shop status', err)
        });
    }
}
