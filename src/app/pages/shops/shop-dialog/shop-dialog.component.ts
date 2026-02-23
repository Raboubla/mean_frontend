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
import { MatIconModule } from '@angular/material/icon';

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
        MatIconModule
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
    selectedFile: File | null = null;
    errorMessage: string = '';

    constructor(
        public dialogRef: MatDialogRef<AppShopDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        private shopService: ShopService
    ) {
        this.local_data = { ...data };
        this.action = this.local_data.action;

        // Initialize contact separately to avoid null errors
        const contact = this.local_data.contact || {};
        const social = contact.social_media || {};

        this.shopForm = this.fb.group({
            _id: [this.local_data._id],
            name: [this.local_data.name || '', Validators.required],
            category: [this.local_data.category || [], Validators.required],
            floor: [this.local_data.floor, [Validators.required, Validators.min(0)]],
            description: [this.local_data.description || ''],
            status: [this.local_data.status || 'OPEN', Validators.required],
            opening_hours: this.fb.array([]),
            // Contact fields
            contact: this.fb.group({
                phone: [contact.phone || ''],
                email: [contact.email || '', [Validators.email]],
                social_media: this.fb.group({
                    facebook: [social.facebook || ''],
                    instagram: [social.instagram || '']
                })
            })
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

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
        }
    }

    // Filter out unchecked days before submitting
    doAction() {
        if (this.shopForm.valid) {
            const formValue = this.shopForm.getRawValue();
            this.errorMessage = '';

            // Filter opening_hours
            const activeHours = formValue.opening_hours
                .filter((h: any) => h.selected)
                .map((h: any) => ({ day: h.day, open: h.open, close: h.close }));

            // Prepare Data
            const formData = new FormData();

            // Append simple fields
            formData.append('name', formValue.name);
            formData.append('floor', formValue.floor);
            formData.append('description', formValue.description || '');
            formData.append('status', formValue.status);

            // Append complex fields as JSON strings
            formData.append('category', JSON.stringify(formValue.category));
            formData.append('opening_hours', JSON.stringify(activeHours));
            formData.append('contact', JSON.stringify(formValue.contact));

            // Append Image
            if (this.selectedFile) {
                formData.append('banner', this.selectedFile);
            }

            if (this.action === 'Add') {
                this.shopService.createShop(formData).subscribe({
                    next: (res) => this.dialogRef.close({ event: this.action, data: res }),
                    error: (err) => {
                        console.error('Error creating shop', err);
                        this.errorMessage = err.error?.message || 'An error occurred while creating the shop.';
                    }
                });
            } else {
                this.shopService.updateShop(formValue._id, formData).subscribe({
                    next: (res) => this.dialogRef.close({ event: this.action, data: res.shop || res }), // Return updated shop
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
