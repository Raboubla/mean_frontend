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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-product-dialog',
    standalone: true,
    providers: [provideNativeDateAdapter()],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatDialogModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule
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
    selectedFile: File | null = null;

    constructor(
        public dialogRef: MatDialogRef<AppProductDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        private productService: ProductService,
        private shopService: ShopService
    ) {
        this.local_data = { ...data };
        this.action = this.local_data.action;

        // Ensure promotion object exists to avoid null errors if it's missing in local_data
        const promotion = this.local_data.promotion || {};

        this.productForm = this.fb.group({
            _id: [this.local_data._id],
            name: [this.local_data.name || '', Validators.required],
            description: [this.local_data.description || ''],
            price: [this.local_data.price || 0, [Validators.required, Validators.min(0)]],
            category: [this.local_data.category || 'OTHER', Validators.required],
            status: [this.local_data.status || 'AVAILABLE', Validators.required],
            shop: [this.local_data.shop?._id || this.local_data.shop || '', Validators.required],
            is_active: [this.local_data.is_active !== undefined ? this.local_data.is_active : true],
            // Promotion fields
            promo_discount_percent: [promotion.discount_percent || 0, [Validators.min(0), Validators.max(100)]],
            promo_price: [this.getDecimalValue(promotion.promo_price) || null],
            promo_end_date: [promotion.end_date || null]
        });

        this.setupPromotionLogic();
    }

    // Helper to extract decimal value if it comes as { $numberDecimal: "..." }
    getDecimalValue(val: any): number | null {
        if (val && val.$numberDecimal) {
            return parseFloat(val.$numberDecimal);
        }
        return val ? Number(val) : null;
    }

    ngOnInit(): void {
        this.getShops();
    }

    setupPromotionLogic() {
        const priceControl = this.productForm.get('price');
        const discountControl = this.productForm.get('promo_discount_percent');
        const promoPriceControl = this.productForm.get('promo_price');

        if (!priceControl || !discountControl || !promoPriceControl) return;

        // When discount % changes -> calculate promo price
        discountControl.valueChanges.subscribe(discount => {
            if (discountControl.dirty || discountControl.touched) {
                const price = priceControl.value;
                if (price && discount >= 0 && discount <= 100) {
                    const newPromoPrice = price - (price * (discount / 100));
                    promoPriceControl.setValue(Number(newPromoPrice.toFixed(2)), { emitEvent: false });
                } else if (!discount) {
                    promoPriceControl.setValue(null, { emitEvent: false });
                }
            }
        });

        // When promo price changes -> calculate discount %
        promoPriceControl.valueChanges.subscribe(promoPrice => {
            if (promoPriceControl.dirty || promoPriceControl.touched) {
                const price = priceControl.value;
                if (price && promoPrice !== null && promoPrice >= 0 && promoPrice <= price) {
                    const discount = ((price - promoPrice) / price) * 100;
                    discountControl.setValue(Number(discount.toFixed(2)), { emitEvent: false });
                }
            }
        });

        // When base price changes -> recalculate promo price based on existing discount
        priceControl.valueChanges.subscribe(price => {
            const discount = discountControl.value;
            if (price && discount) {
                const newPromoPrice = price - (price * (discount / 100));
                promoPriceControl.setValue(Number(newPromoPrice.toFixed(2)), { emitEvent: false });
            }
        });
    }

    getShops() {
        this.shopService.getAllShops().subscribe({
            next: (res: any) => {
                this.shops = Array.isArray(res) ? res : (res.shops || []);
            },
            error: (err) => console.error('Error fetching shops', err)
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
        }
    }

    doAction() {
        if (this.productForm.valid) {
            const formValue = this.productForm.value;
            this.errorMessage = '';

            const formData = new FormData();

            // Append simple fields
            formData.append('name', formValue.name);
            formData.append('description', formValue.description || '');
            formData.append('price', formValue.price);
            formData.append('category', formValue.category);
            formData.append('status', formValue.status);
            formData.append('shop', formValue.shop);
            formData.append('is_active', formValue.is_active);

            // Construct and append promotion object if valid
            const promotion: any = {
                discount_percent: formValue.promo_discount_percent,
                promo_price: formValue.promo_price,
                end_date: formValue.promo_end_date
            };

            // Remove promotion fields if empty/invalid to avoid sending partial data
            if (!promotion.discount_percent && !promotion.promo_price) {
                // Do nothing or send null? 
                // Better to not send usage of promotion if not active
            } else {
                formData.append('promotion', JSON.stringify(promotion));
            }

            // Append image
            if (this.selectedFile) {
                formData.append('image', this.selectedFile);
            }

            if (this.action === 'Add') {
                this.productService.createProduct(formData).subscribe({
                    next: (res) => this.dialogRef.close({ event: this.action, data: res }),
                    error: (err) => {
                        console.error('Error creating product', err);
                        this.errorMessage = err.error?.message || 'Error creating product';
                    }
                });
            } else {
                this.productService.updateProduct(formValue._id, formData).subscribe({
                    next: (res) => this.dialogRef.close({ event: this.action, data: res.product || res }),
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
