import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ReviewService, Review } from '../../../services/review-services/review-services.service';
import { AppReviewDialogComponent } from '../review-dialog/review-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-reviews',
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
    templateUrl: './review-list.component.html',
})
export class AppReviewComponent implements OnInit {
    displayedColumns: string[] = ['customer_name', 'rating', 'shop', 'status', 'comment', 'actions'];
    dataSource: MatTableDataSource<Review>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(public dialog: MatDialog, private reviewService: ReviewService) {
        this.dataSource = new MatTableDataSource<Review>();
    }

    ngOnInit(): void {
        this.loadReviews();
    }

    loadReviews() {
        this.reviewService.getAllReviews().subscribe({
            next: (res: any) => {
                const reviews = Array.isArray(res) ? res : (res.reviews || []);
                this.dataSource.data = reviews;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            error: (err) => console.error('Error fetching reviews', err)
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
        const dialogRef = this.dialog.open(AppReviewDialogComponent, {
            data: obj,
            width: '600px',
            maxHeight: '90vh'
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.event !== 'Cancel') {
                this.loadReviews();
            }
        });
    }

    deleteReview(obj: any) {
        if (confirm('Are you sure you want to delete this review?')) {
            this.reviewService.deleteReview(obj._id).subscribe({
                next: () => this.loadReviews(),
                error: (err) => console.error('Error deleting review', err)
            });
        }
    }

    toggleStatus(obj: any) {
        // Rotate status or simple approve/reject cycle?
        // Let's cycle: PENDING -> APPROVED -> REJECTED -> PENDING
        const statusOrder = ['PENDING', 'APPROVED', 'REJECTED'];
        const currentIndex = statusOrder.indexOf(obj.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

        this.reviewService.updateReviewStatus(obj._id, nextStatus).subscribe({
            next: () => this.loadReviews(),
            error: (err) => console.error('Error updating status', err)
        });
    }
}
