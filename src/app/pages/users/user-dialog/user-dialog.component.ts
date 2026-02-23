import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user-services/user.service';
import { ShopService } from '../../../services/shop-services/shop.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

import { MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-user-dialog',
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
    ],
    templateUrl: './user-dialog.component.html',
})
export class AppUserDialogComponent {
    action: string;
    local_data: any;
    userForm: FormGroup;
    roles = ['ADMIN', 'BUYER', 'SHOP_ADMIN'];
    permissionsList = ['CASHIER', 'MASCOT', 'SELLER', 'RECEPTIONIST', 'ADMIN'];
    statusList = ['ACTIVE', 'INACTIVE', 'BANNED', 'PENDING'];

    shops: any[] = [];

    constructor(
        public dialogRef: MatDialogRef<AppUserDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        private userService: UserService,
        private shopService: ShopService
    ) {
        this.local_data = { ...data };
        this.action = this.local_data.action;

        this.userForm = this.fb.group({
            _id: [this.local_data._id],
            email: [this.local_data.email || '', [Validators.required, Validators.email]],
            role: [this.local_data.role || 'SHOP_ADMIN', Validators.required],
            permission: [this.local_data.permission || []],
            status: [this.local_data.status || 'ACTIVE', Validators.required],
            shopId: [this.local_data.shop?._id || this.local_data.shopId || ''],
            password: ['']
        });

        if (this.action === 'Add') {
            this.userForm.get('password')?.setValidators([Validators.required]);
        }

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

    errorMessage: string = '';

    doAction() {
        if (this.userForm.valid) {
            const userData = this.userForm.value;
            this.errorMessage = ''; // Clear previous errors

            if (this.action === 'Add') {
                this.userService.createUser(userData).subscribe({
                    next: () => this.dialogRef.close({ event: this.action, data: userData }),
                    error: (err) => {
                        console.error('Error creating user', err);
                        this.errorMessage = err.error?.message || 'An error occurred while creating the user.';
                    }
                });
            } else {
                // For update, we might not want to send password if it's empty
                if (!userData.password) {
                    delete userData.password;
                }
                this.userService.updateUser(userData._id, userData).subscribe({
                    next: () => this.dialogRef.close({ event: this.action, data: userData }),
                    error: (err) => {
                        console.error('Error updating user', err);
                        this.errorMessage = err.error?.message || 'An error occurred while updating the user.';
                    }
                });
            }
        }
    }

    closeDialog() {
        this.dialogRef.close({ event: 'Cancel' });
    }
}
