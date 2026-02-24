import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { ReviewService, Review } from '../../../services/review-services/review-services.service';
import { AppReviewDialogComponent } from '../review-dialog/review-dialog.component';
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
    selector: 'app-reviews',
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
    templateUrl: './review-list.component.html',
})
export class AppReviewComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ['customer_name', 'rating', 'shop', 'status', 'comment', 'actions'];
    dataSource: MatTableDataSource<Review>;
    isLoading = false;

    // Filter state
    searchQuery = '';
    selectedStatus = '';

    readonly statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'SPAM', label: 'Spam' },
    ];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    private searchSubject = new Subject<string>();
    private destroy$ = new Subject<void>();

    constructor(public dialog: MatDialog, private reviewService: ReviewService) {
        this.dataSource = new MatTableDataSource<Review>();
    }

    ngOnInit(): void {
        this.searchSubject.pipe(
            debounceTime(350),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => this.fetchReviews());

        this.fetchReviews();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSearchInput(value: string): void {
        this.searchQuery = value;
        this.searchSubject.next(value);
    }

    onStatusChange(): void {
        this.fetchReviews();
    }

    fetchReviews(): void {
        this.isLoading = true;
        this.reviewService.searchReviews(
            this.searchQuery || undefined,
            this.selectedStatus || undefined
        ).subscribe({
            next: (res: any) => {
                const reviews = Array.isArray(res) ? res : (res.reviews || []);
                this.dataSource.data = reviews;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.isLoading = false;
            },
            error: (err) => { console.error('Error fetching reviews', err); this.isLoading = false; }
        });
    }

    openDialog(action: string, obj: any): void {
        obj.action = action;
        const dialogRef = this.dialog.open(AppReviewDialogComponent, {
            data: obj, width: '600px', maxHeight: '90vh'
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.event !== 'Cancel') this.fetchReviews();
        });
    }

    deleteReview(obj: any): void {
        if (confirm('Are you sure you want to delete this review?')) {
            this.reviewService.deleteReview(obj._id).subscribe({
                next: () => this.fetchReviews(),
                error: (err) => console.error('Error deleting review', err)
            });
        }
    }

    toggleStatus(obj: any): void {
        const statusOrder = ['PENDING', 'APPROVED', 'REJECTED'];
        const nextStatus = statusOrder[(statusOrder.indexOf(obj.status) + 1) % statusOrder.length];
        this.reviewService.updateReviewStatus(obj._id, nextStatus).subscribe({
            next: () => this.fetchReviews(),
            error: (err) => console.error('Error updating status', err)
        });
    }
}
