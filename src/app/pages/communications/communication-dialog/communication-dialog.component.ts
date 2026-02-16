import { Component, Inject, Optional, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommunicationService } from '../../../services/communication-services/communication-services.service';
import { ShopService } from '../../../services/shop-services/shop.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core'; //

@Component({
    selector: 'app-communication-dialog',
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
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule
    ],
    templateUrl: './communication-dialog.component.html',
})
export class AppCommunicationDialogComponent implements OnInit {
    action: string;
    local_data: any;
    commForm: FormGroup;
    shops: any[] = [];
    errorMessage: string = '';
    selectedFile: File | null = null;

    constructor(
        public dialogRef: MatDialogRef<AppCommunicationDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        private communicationService: CommunicationService,
        private shopService: ShopService
    ) {
        this.local_data = { ...data };
        this.action = this.local_data.action;

        this.commForm = this.fb.group({
            _id: [this.local_data._id],
            title: [this.local_data.title || '', Validators.required],
            content: [this.local_data.content || '', Validators.required],
            type: [this.local_data.type || 'ANNOUNCEMENT', Validators.required],
            target: [this.local_data.target || 'ALL', Validators.required],
            start_date: [this.local_data.start_date || '', Validators.required],
            end_date: [this.local_data.end_date || '', Validators.required],
            shop: [this.local_data.shop?._id || this.local_data.shop || '']
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

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
        }
    }

    doAction() {
        if (this.commForm.valid) {
            const formData = new FormData();
            const formValue = this.commForm.value;

            // Append basic fields
            formData.append('title', formValue.title);
            formData.append('content', formValue.content);
            formData.append('type', formValue.type);
            formData.append('target', formValue.target);
            formData.append('start_date', formValue.start_date);
            formData.append('end_date', formValue.end_date);

            if (formValue.shop) {
                formData.append('shop', formValue.shop);
            }

            // Append image if selected
            if (this.selectedFile) {
                formData.append('image', this.selectedFile);
            }

            this.errorMessage = '';

            if (this.action === 'Add') {
                this.communicationService.createCommunication(formData).subscribe({
                    next: (res) => this.dialogRef.close({ event: this.action, data: res }),
                    error: (err) => {
                        console.error('Error creating communication', err);
                        this.errorMessage = err.error?.message || 'Error creating communication';
                    }
                });
            } else {
                this.communicationService.updateCommunication(formValue._id, formData).subscribe({
                    next: () => this.dialogRef.close({ event: this.action, data: formValue }),
                    error: (err) => {
                        console.error('Error updating communication', err);
                        this.errorMessage = err.error?.message || 'Error updating communication';
                    }
                });
            }
        }
    }

    closeDialog() {
        this.dialogRef.close({ event: 'Cancel' });
    }
}
