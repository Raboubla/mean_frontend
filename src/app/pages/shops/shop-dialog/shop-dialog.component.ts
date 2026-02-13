import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { ShopService } from '../../../services/shop-services/shop.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-shop-dialog',
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
        MatCheckboxModule,
    ],
    templateUrl: './shop-dialog.component.html',
})
export class AppShopDialogComponent {
    action: string;
    local_data: any;
    shopForm: FormGroup;
    categories = ['FASHION', 'FOOD', 'ELECTRONICS', 'LEISURE', 'RESTAURANT', 'BEAUTY'];
    statusList = ['OPEN', 'CLOSED', 'UNDER_RENOVATION', 'COMING_SOON'];
    daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    constructor(
        public dialogRef: MatDialogRef<AppShopDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        private shopService: ShopService
    ) {
        this.local_data = { ...data };
        this.action = this.local_data.action;

        this.shopForm = this.fb.group({
            _id: [this.local_data._id],
            name: [this.local_data.name || '', Validators.required],
            category: [this.local_data.category || [], Validators.required],
            floor: [this.local_data.floor, [Validators.required, Validators.min(0)]],
            description: [this.local_data.description || ''],
            status: [this.local_data.status || 'OPEN', Validators.required],
            opening_hours: this.fb.array([])
        });

        this.initOpeningHours();
    }

    get openingHours(): FormArray {
        return this.shopForm.get('opening_hours') as FormArray;
    }

    initOpeningHours() {
        const existingHours = this.local_data.opening_hours || [];

        this.daysOfWeek.forEach(day => {
            const existingDay = existingHours.find((h: any) => h.day === day);
            const isOpen = !!existingDay;

            const group = this.fb.group({
                day: [day],
                selected: [isOpen], // Checkbox control
                open: [{ value: existingDay ? existingDay.open : '09:00', disabled: !isOpen }, Validators.required],
                close: [{ value: existingDay ? existingDay.close : '20:00', disabled: !isOpen }, Validators.required]
            });

            // Listen to checkbox changes to enable/disable time inputs
            group.get('selected')?.valueChanges.subscribe((selected: any) => {
                const isSelected = selected as boolean;
                const openControl = group.get('open');
                const closeControl = group.get('close');
                if (isSelected) {
                    openControl?.enable();
                    closeControl?.enable();
                } else {
                    openControl?.disable();
                    closeControl?.disable();
                }
            });

            this.openingHours.push(group);
        });
    }

    errorMessage: string = '';

    // Filter out unchecked days before submitting
    doAction() {
        if (this.shopForm.valid) {
            const formValue = this.shopForm.getRawValue(); // getRawValue to include disabled fields if needed, but we actually want to filter
            this.errorMessage = '';

            // Filter opening_hours
            const activeHours = formValue.opening_hours
                .filter((h: any) => h.selected)
                .map((h: any) => ({ day: h.day, open: h.open, close: h.close }));

            const shopData = { ...formValue, opening_hours: activeHours };
            delete shopData.selected; // clean up if needed, though map handled it

            if (this.action === 'Add') {
                this.shopService.createShop(shopData).subscribe({
                    next: (res) => this.dialogRef.close({ event: this.action, data: res }),
                    error: (err) => {
                        console.error('Error creating shop', err);
                        this.errorMessage = err.error?.message || 'An error occurred while creating the shop.';
                    }
                });
            } else {
                this.shopService.updateShop(shopData._id, shopData).subscribe({
                    next: () => this.dialogRef.close({ event: this.action, data: shopData }),
                    error: (err) => {
                        console.error('Error updating shop', err);
                        this.errorMessage = err.error?.message || 'An error occurred while updating the shop.';
                    }
                });
            }
        }
    }

    closeDialog() {
        this.dialogRef.close({ event: 'Cancel' });
    }
}
