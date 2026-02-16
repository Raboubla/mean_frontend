import { Component, Inject, Optional, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SaleService } from '../../../services/sale-services/sale-services.service';
import { ShopService } from '../../../services/shop-services/shop.service';
import { ProductService, Product } from '../../../services/product-services/product.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
    selector: 'app-sale-dialog',
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
        MatDatepickerModule,
        MatNativeDateModule
    ],
    templateUrl: './sale-dialog.component.html',
})
export class AppSaleDialogComponent implements OnInit {
    action: string;
    local_data: any;
    saleForm: FormGroup;
    shops: any[] = [];
    products: any[] = [];
    errorMessage: string = '';

    constructor(
        public dialogRef: MatDialogRef<AppSaleDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        private saleService: SaleService,
        private shopService: ShopService,
        private productService: ProductService
    ) {
        this.local_data = { ...data };
        this.action = this.local_data.action;

        this.saleForm = this.fb.group({
            _id: [this.local_data._id],
            shop: [this.local_data.shop?._id || this.local_data.shop || '', Validators.required],
            product: [this.local_data.product?._id || this.local_data.product || '', Validators.required],
            quantity: [this.local_data.quantity || 1, [Validators.required, Validators.min(1)]],
            unit_price: [this.local_data.unit_price || 0, [Validators.required, Validators.min(0)]],
            total_price: [{ value: this.local_data.total_price || 0, disabled: true }, Validators.required],
        });

        // Recalculate total price on quantity or unit_price change
        this.saleForm.get('quantity')?.valueChanges.subscribe(() => this.calculateTotal());
        this.saleForm.get('unit_price')?.valueChanges.subscribe(() => this.calculateTotal());

        // Create listener for Shop changes to filter products
        this.saleForm.get('shop')?.valueChanges.subscribe((shopId) => {
            if (shopId) this.getProductsByShop(shopId);
        });

        // Create listener for Product changes to set unit price
        this.saleForm.get('product')?.valueChanges.subscribe((productId) => {
            if (productId) this.setProductPrice(productId);
        });
    }

    ngOnInit(): void {
        this.getShops();
        // If editing, load products for the selected shop
        if (this.local_data.shop) {
            const shopId = this.local_data.shop._id || this.local_data.shop;
            this.getProductsByShop(shopId);
        }
    }

    getShops() {
        this.shopService.getAllShops().subscribe({
            next: (res: any) => {
                this.shops = Array.isArray(res) ? res : (res.shops || []);
            },
            error: (err) => console.error('Error fetching shops', err)
        });
    }

    getProductsByShop(shopId: string) {
        this.productService.getProductsByShop(shopId).subscribe({
            next: (res: any) => {
                this.products = res.products;
            },
            error: (err) => console.error('Error fetching products', err)
        });
    }

    setProductPrice(productId: string) {
        const product = this.products.find(p => p._id === productId);
        if (product) {
            // Format price if it's Decimal128 object
            let price = product.price;
            if (typeof price === 'object' && price !== null && (price as any).$numberDecimal) {
                price = parseFloat((price as any).$numberDecimal);
            }
            this.saleForm.patchValue({ unit_price: price });
        }
    }

    calculateTotal() {
        const qty = this.saleForm.get('quantity')?.value || 0;
        const price = this.saleForm.get('unit_price')?.value || 0;
        const total = qty * price;
        this.saleForm.patchValue({ total_price: total.toFixed(2) }); // Display purpose
    }

    doAction() {
        if (this.saleForm.valid || (this.saleForm.disabled && this.saleForm.getRawValue())) { // Handle disabled total_price
            const formValue = this.saleForm.getRawValue(); // Get all values including disabled
            this.errorMessage = '';

            if (this.action === 'Add') {
                this.saleService.createSale(formValue).subscribe({
                    next: (res) => this.dialogRef.close({ event: this.action, data: res }),
                    error: (err) => {
                        console.error('Error creating sale', err);
                        this.errorMessage = err.error?.message || 'Error creating sale';
                    }
                });
            } else {
                this.saleService.updateSale(formValue._id, formValue).subscribe({
                    next: () => this.dialogRef.close({ event: this.action, data: formValue }),
                    error: (err) => {
                        console.error('Error updating sale', err);
                        this.errorMessage = err.error?.message || 'Error updating sale';
                    }
                });
            }
        }
    }

    closeDialog() {
        this.dialogRef.close({ event: 'Cancel' });
    }
}
