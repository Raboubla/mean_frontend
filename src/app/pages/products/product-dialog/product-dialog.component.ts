import { Component, Inject, Optional, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product-services/product.service';
import { ShopService } from '../../../services/shop-services/shop.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-product-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatDialogModule,
        MatCheckboxModule
    ],
    templateUrl: './product-dialog.component.html',
})
export class AppProductDialogComponent implements OnInit {
    action: string;
    local_data: any;
    productForm: FormGroup;
    categories = ['ELECTRONICS', 'CLOTHING', 'HOME', 'FOOD', 'TOYS', 'BEAUTY', 'OTHER'];
    statusList = ['AVAILABLE', 'OUT_OF_STOCK', 'DISCONTINUED', 'PRE_ORDER'];
    shops: any[] = [];
    errorMessage: string = '';

    constructor(
        public dialogRef: MatDialogRef<AppProductDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        private productService: ProductService,
        private shopService: ShopService
    ) {
        this.local_data = { ...data };
        this.action = this.local_data.action;

        this.productForm = this.fb.group({
            _id: [this.local_data._id],
            name: [this.local_data.name || '', Validators.required],
            description: [this.local_data.description || ''],
            price: [this.local_data.price || 0, [Validators.required, Validators.min(0)]],
            category: [this.local_data.category || 'OTHER', Validators.required],
            status: [this.local_data.status || 'AVAILABLE', Validators.required],
            shop: [this.local_data.shop?._id || this.local_data.shop || '', Validators.required],
            is_active: [this.local_data.is_active !== undefined ? this.local_data.is_active : true]
        });
    }

    ngOnInit(): void {
        this.getShops();
    }

    getShops() {
        this.shopService.getAllShops().subscribe({
            next: (res: any) => {
                // Handle if response is array or object with array
                this.shops = Array.isArray(res) ? res : (res.shops || []);
            },
            error: (err) => console.error('Error fetching shops', err)
        });
    }

    doAction() {
        if (this.productForm.valid) {
            const productData = this.productForm.value;
            this.errorMessage = '';

            if (this.action === 'Add') {
                this.productService.createProduct(productData).subscribe({
                    next: (res) => this.dialogRef.close({ event: this.action, data: res }),
                    error: (err) => {
                        console.error('Error creating product', err);
                        this.errorMessage = err.error?.message || 'Error creating product';
                    }
                });
            } else {
                this.productService.updateProduct(productData._id, productData).subscribe({
                    next: () => this.dialogRef.close({ event: this.action, data: productData }),
                    error: (err) => {
                        console.error('Error updating product', err);
                        this.errorMessage = err.error?.message || 'Error updating product';
                    }
                });
            }
        }
    }

    closeDialog() {
        this.dialogRef.close({ event: 'Cancel' });
    }
}
