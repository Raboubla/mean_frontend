import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { ReviewService, Review } from '../../../services/review-services/review-services.service';
import { ShopService } from '../../../services/shop-services/shop.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

@Component({
    selector: 'app-shop-admin-reviews',
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
        MatChipsModule,
        MatDividerModule
    ],
    templateUrl: './reviews.component.html',
})
export class AppShopAdminReviewsComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ['customer_name', 'rating', 'comment', 'status', 'created_at', 'actions'];
    dataSource: MatTableDataSource<Review>;
    isLoading = false;
    shopId: string | null = null;

    // Filter state
    searchQuery = '';
    selectedStatus = '';

    statusOptions = [
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

    constructor(
        private reviewService: ReviewService,
        private shopService: ShopService
    ) {
        this.dataSource = new MatTableDataSource<Review>();
    }

    ngOnInit(): void {
        this.isLoading = true;
        this.shopService.getMyShop().subscribe({
            next: (shop) => {
                if (shop && shop._id) {
                    this.shopId = shop._id;
                    this.fetchReviews();
                } else {
                    this.isLoading = false;
                }
            },
            error: (err) => {
                console.error('Failed to load shop', err);
                this.isLoading = false;
            }
        });

        this.searchSubject.pipe(
            debounceTime(350),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(() => this.fetchReviews());
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSearchInput(value: string): void {
        this.searchQuery = value;
        this.searchSubject.next(value);
    }

    onFilterChange(): void {
        this.fetchReviews();
    }

    fetchReviews(): void {
        if (!this.shopId) return;

        this.isLoading = true;
        // The backend GET /api/reviews doesn't let us search by query+status AND force a shopId easily 
        // without adding an extra route or parameter.
        // We will fetch by shop and then filter locally for simplicity, OR if your backend supports it, we'd pass it.
        // Since getReviewsByShop doesn't take search params in the current service:

        this.reviewService.getReviewsByShop(this.shopId).subscribe({
            next: (res: any) => {
                let reviews: Review[] = Array.isArray(res) ? res : (res.reviews || []);

                // Local Filtering
                if (this.searchQuery) {
                    const q = this.searchQuery.toLowerCase();
                    reviews = reviews.filter((r) =>
                        r.customer_name.toLowerCase().includes(q) ||
                        (r.comment && r.comment.toLowerCase().includes(q))
                    );
                }
                if (this.selectedStatus) {
                    reviews = reviews.filter((r) => r.status === this.selectedStatus);
                }

                this.dataSource.data = reviews;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching reviews', err);
                this.isLoading = false;
            }
        });
    }

    updateStatus(reviewId: string | undefined, status: string): void {
        if (!reviewId) return;
        this.reviewService.updateReviewStatus(reviewId, status).subscribe({
            next: () => this.fetchReviews(),
            error: (err) => console.error('Error updating review status', err)
        });
    }

    deleteReview(obj: Review): void {
        if (!obj._id) return;
        if (confirm(`Are you sure you want to delete this review by ${obj.customer_name}?`)) {
            this.reviewService.deleteReview(obj._id).subscribe({
                next: () => this.fetchReviews(),
                error: (err) => console.error('Error deleting review', err)
            });
        }
    }
}
