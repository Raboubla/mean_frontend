import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AppNewCustomersComponent } from 'src/app/components/new-customers/new-customers.component';
import { AppTotalIncomeComponent } from 'src/app/components/total-income/total-income.component';
import { AppDailyActivitiesComponent } from 'src/app/components/daily-activities/daily-activities.component';
import { AppBlogCardsComponent } from 'src/app/components/blog-card/blog-card.component';
import { AppRevenueProductComponent } from 'src/app/components/revenue-product/revenue-product.component';
import { AppRevenueForecastComponent } from 'src/app/components/revenue-forecast/revenue-forecast.component';
import {
  DashboardService, DashboardStats,
  TopShopByViews, TopShopByProducts, TopProductBySales
} from '../../services/dashboard.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface StatCard {
  label: string;
  key: keyof DashboardStats['stats'];
  icon: string;
  color: string;
  bgColor: string;
  routerLink: string;
}

@Component({
  selector: 'app-starter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MaterialModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    AppNewCustomersComponent,
    AppTotalIncomeComponent,
    AppDailyActivitiesComponent,
    AppBlogCardsComponent,
    AppRevenueProductComponent,
    AppRevenueForecastComponent,
  ],
  templateUrl: './starter.component.html',
  styleUrls: ['./starter.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StarterComponent implements OnInit {
  selectedMonth: number = 0;
  selectedYear: number;
  isLoading = false;
  isLoadingRanks = false;

  stats: DashboardStats['stats'] = {
    users: 0, shops: 0, products: 0,
    sales: 0, communications: 0, reviews: 0,
  };

  // Leaderboard data
  topShopsByViews: TopShopByViews[] = [];
  topShopsByProducts: TopShopByProducts[] = [];
  topProductsBySales: TopProductBySales[] = [];

  months = [
    { value: 0, label: '— All Year —' },
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];

  years: number[] = [];

  statCards: StatCard[] = [
    { label: 'Users', key: 'users', icon: 'people', color: '#5d87ff', bgColor: '#ebf3fe', routerLink: '/admin/users' },
    { label: 'Shops', key: 'shops', icon: 'store', color: '#49beff', bgColor: '#e8f7ff', routerLink: '/admin/shops' },
    { label: 'Products', key: 'products', icon: 'inventory_2', color: '#13deb9', bgColor: '#e6faf5', routerLink: '/admin/products' },
    { label: 'Sales', key: 'sales', icon: 'point_of_sale', color: '#fa896b', bgColor: '#fef5f2', routerLink: '/admin/sales' },
    { label: 'Communications', key: 'communications', icon: 'campaign', color: '#ffae1f', bgColor: '#fff8ec', routerLink: '/admin/communications' },
    { label: 'Reviews', key: 'reviews', icon: 'star', color: '#7c52ff', bgColor: '#f0ebff', routerLink: '/admin/reviews' },
  ];

  constructor(private dashboardService: DashboardService) {
    const now = new Date();
    this.selectedMonth = 0;
    this.selectedYear = now.getFullYear();
    for (let y = now.getFullYear(); y >= 2024; y--) {
      this.years.push(y);
    }
  }

  ngOnInit(): void {
    this.fetchStats();
    this.fetchLeaderboards();
  }

  fetchStats(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardStats(this.selectedMonth, this.selectedYear).subscribe({
      next: (res) => { this.stats = res.stats; this.isLoading = false; },
      error: (err) => { console.error('Dashboard stats error', err); this.isLoading = false; }
    });
  }

  fetchLeaderboards(): void {
    this.isLoadingRanks = true;
    forkJoin({
      views: this.dashboardService.getTopShopsByViews(3),
      products: this.dashboardService.getTopShopsByProducts(5),
      sales: this.dashboardService.getTopProductsBySales(5),
    }).subscribe({
      next: ({ views, products, sales }) => {
        this.topShopsByViews = views;
        this.topShopsByProducts = products;
        this.topProductsBySales = sales;
        this.isLoadingRanks = false;
      },
      error: (err) => { console.error('Leaderboard error', err); this.isLoadingRanks = false; }
    });
  }

  onFilterChange(): void {
    this.fetchStats();
  }
}
