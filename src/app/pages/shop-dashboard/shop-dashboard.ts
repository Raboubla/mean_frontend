import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { ShopService, Shop } from '../../services/shop-services/shop.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-shop-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  templateUrl: './shop-dashboard.component.html'
})
export class ShopDashboardComponent implements OnInit {

  shopForm: FormGroup;
  shop: Shop | null = null;

  categories = ['FASHION', 'FOOD', 'ELECTRONICS', 'LEISURE', 'RESTAURANT', 'BEAUTY'];
  statusList = ['OPEN', 'CLOSED', 'UNDER_RENOVATION', 'COMING_SOON'];
  daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  errorMessage = '';

  constructor(private fb: FormBuilder, private shopService: ShopService) {
    this.shopForm = this.fb.group({
      _id: [''],
      name: ['', Validators.required],
      category: [[], Validators.required],
      floor: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      status: ['OPEN', Validators.required],
      opening_hours: this.fb.array([])
    });
  }

  ngOnInit() {
    // Fetch the shop for this user
    this.shopService.getMyShop().subscribe({
      next: (data) => {
        if (data) {
          this.shop = data;
          this.populateForm(data);
        }
      },
      error: (err) => console.error(err)
    });
  }

  get openingHours(): FormArray {
    return this.shopForm.get('opening_hours') as FormArray;
  }

  populateForm(shop: Shop) {
    this.shopForm.patchValue({
      _id: shop._id,
      name: shop.name,
      category: shop.category,
      floor: shop.floor,
      description: shop.description,
      status: shop.status
    });

    // Initialize opening hours
    this.daysOfWeek.forEach(day => {
      const existingDay = shop.opening_hours.find(h => h.day === day);
      const isOpen = !!existingDay;

      const group = this.fb.group({
        day: [day],
        selected: [isOpen],
        open: [{ value: existingDay ? existingDay.open : '09:00', disabled: !isOpen }, Validators.required],
        close: [{ value: existingDay ? existingDay.close : '20:00', disabled: !isOpen }, Validators.required]
      });

      // Enable/disable time inputs on checkbox toggle
      group.get('selected')?.valueChanges.subscribe(selected => {
        const openControl = group.get('open');
        const closeControl = group.get('close');
        if (selected) {
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

  submitForm() {
    if (!this.shopForm.valid) return;

    const formValue = this.shopForm.getRawValue();

    // Filter opening_hours
    const activeHours = formValue.opening_hours
      .filter((h: any) => h.selected)
      .map((h: any) => ({ day: h.day, open: h.open, close: h.close }));

    const shopData = { ...formValue, opening_hours: activeHours };

    if (!this.shop) {
      // Create
      this.shopService.createShop(shopData).subscribe({
        next: (res) => {
          this.shop = res.shop;
          this.populateForm(this.shop!);
        },
        error: (err) => this.errorMessage = err.error?.message || 'Error creating shop'
      });
    } else {
      // Update
      this.shopService.updateShop(shopData._id, shopData).subscribe({
        next: (res) => {
          this.shop = res.shop || shopData;
          this.populateForm(this.shop!);
        },
        error: (err) => this.errorMessage = err.error?.message || 'Error updating shop'
      });
    }
  }
}