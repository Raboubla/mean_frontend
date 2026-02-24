import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ShopService, Shop } from '../../../services/shop-services/shop.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-client-home',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,

        MatCardModule,
        RouterModule,
        FormsModule,
    ],
    templateUrl: './home.component.html',
})
export class ClientHomeComponent implements OnInit, OnDestroy {
    allShops: Shop[] = [];
    shops: Shop[] = [];
    isLoading = true;

    searchQuery = '';
    selectedFloor: number | null = null;  // null = all floors

    private searchSubject = new Subject<string>();

    constructor(private shopService: ShopService) { }

    ngOnInit(): void {
        this.fetchShops();

        this.searchSubject.pipe(
            debounceTime(400),
            distinctUntilChanged()
        ).subscribe(() => this.applyFilters());
    }

    ngOnDestroy(): void {
        this.searchSubject.complete();
    }

    fetchShops(): void {
        this.isLoading = true;
        this.shopService.getAllShops().subscribe({
            next: (res: any) => {
                this.allShops = Array.isArray(res) ? res : (res.shops || []);
                this.applyFilters();
                this.isLoading = false;
            },
            error: (err) => { console.error(err); this.isLoading = false; }
        });
    }

    applyFilters(): void {
        let result = [...this.allShops];

        // Floor filter (local — data already fetched)
        if (this.selectedFloor !== null && this.selectedFloor !== undefined) {
            result = result.filter(s => s.floor === this.selectedFloor);
        }

        // Name search: if query → use backend searchShopsByName when no floor selected
        const q = this.searchQuery.trim();
        if (q) {
            if (this.selectedFloor !== null && this.selectedFloor !== undefined) {
                // Local filter on the already-narrowed floor list
                result = result.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));
                this.shops = result;
            } else {
                // Backend search
                this.shopService.searchShopsByName(q).subscribe({
                    next: (res: any) => { this.shops = Array.isArray(res) ? res : (res.shops || []); },
                    error: (err) => console.error(err)
                });
                return;
            }
        } else {
            this.shops = result;
        }
    }

    onSearchChange(): void { this.searchSubject.next(this.searchQuery); }
    onFloorChange(): void { this.applyFilters(); }

    getBannerUrl(shop: Shop): string {
        if (!shop.banner_url) return 'assets/images/products/s1.jpg';
        if (shop.banner_url.startsWith('http')) return shop.banner_url;
        return `${environment.apiUrl.replace('/api', '')}${shop.banner_url}`;
    }
}
