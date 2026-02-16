import { Component, Inject, Optional, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ReviewService } from '../../../services/review-services/review-services.service';
import { ShopService } from '../../../services/shop-services/shop.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-review-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatDialogModule
    ],
    templateUrl: './review-dialog.component.html',
})
export class AppReviewDialogComponent implements OnInit {
    action: string;
    local_data: any;
    reviewForm: FormGroup;
    shops: any[] = [];
    errorMessage: string = '';

    constructor(
        public dialogRef: MatDialogRef<AppReviewDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        private reviewService: ReviewService,
        private shopService: ShopService
    ) {
        this.local_data = { ...data };
        this.action = this.local_data.action;

        this.reviewForm = this.fb.group({
            _id: [this.local_data._id],
            customer_name: [this.local_data.customer_name || '', Validators.required],
            rating: [this.local_data.rating || 5, [Validators.required, Validators.min(1), Validators.max(5)]],
            comment: [this.local_data.comment || ''],
            shop: [this.local_data.shop?._id || this.local_data.shop || '', Validators.required],
            status: [this.local_data.status || 'PENDING', Validators.required]
        });
    }

    ngOnInit(): void {
        this.getShops();
    }

    getShops() {
        this.shopService.getAllShops().subscribe({
            next: (res: any) => {
                this.shops = Array.isArray(res) ? res : (res.shops || []);
            },
            error: (err) => console.error('Error fetching shops', err)
        });
    }

    doAction() {
        if (this.reviewForm.valid) {
            const formValue = this.reviewForm.value;
            this.errorMessage = '';

            if (this.action === 'Add') {
                this.reviewService.createReview(formValue).subscribe({
                    next: (res) => this.dialogRef.close({ event: this.action, data: res }),
                    error: (err) => {
                        console.error('Error creating review', err);
                        this.errorMessage = err.error?.message || 'Error creating review';
                    }
                });
            } else {
                this.reviewService.updateReview(formValue._id, formValue).subscribe({
                    next: () => this.dialogRef.close({ event: this.action, data: formValue }),
                    error: (err) => {
                        console.error('Error updating review', err);
                        this.errorMessage = err.error?.message || 'Error updating review';
                    }
                });
            }
        }
    }

    closeDialog() {
        this.dialogRef.close({ event: 'Cancel' });
    }
}
