import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ShopService, Shop } from '../../../services/shop-services/shop.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppShopDialogComponent } from '../../shops/shop-dialog/shop-dialog.component';
import { environment } from 'src/environments/environment';
@Component({
    selector: 'app-pages-shops',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatDialogModule],
    templateUrl: './pages-shops.component.html',
})
export class AppPagesShopsComponent implements OnInit {
    shop: Shop | null = null;
    isLoading = true;
    bannerColor: string = '#333';

    constructor(
        private shopService: ShopService,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.loadMyShop();
    }

    loadMyShop() {
        this.isLoading = true;
        this.shopService.getMyShop().subscribe({
            next: (data) => {
                this.shop = data;
                this.isLoading = false;
                if (this.shop) {
                    const bannerUrl = this.getBannerUrl(this.shop);
                    if (bannerUrl) {
                        this.extractDominantColor(bannerUrl);
                    }
                }
            },
            error: (err) => {
                console.error('Error loading my shop', err);
                this.isLoading = false;
            }
        });
    }

    editShop() {
        if (!this.shop) return;
        const dialogRef = this.dialog.open(AppShopDialogComponent, {
            data: { ...this.shop, action: 'Update' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.event === 'Update') {
                // Refresh shop data
                this.loadMyShop();
            }
        });
    }


    getBannerUrl(shop: Shop): string {
        if (!shop.banner_url) return '';

        // Si l'URL est déjà complète (commence par http), on la retourne telle quelle
        if (shop.banner_url.startsWith('http')) {
            return shop.banner_url;
        }

        // Sinon, on construit l'URL en utilisant l'apiUrl de l'environment
        // On enlève '/api' de la fin de l'apiUrl pour pointer vers la racine du serveur
        const baseUrl = environment.apiUrl.replace('/api', '');
        return `${baseUrl}${shop.banner_url}`;
    }

    extractDominantColor(imageUrl: string) {
        if (!imageUrl) return;

        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = 1;
            canvas.height = 1;
            ctx.drawImage(img, 0, 0, 1, 1);

            const pixelData = ctx.getImageData(0, 0, 1, 1).data;
            this.bannerColor = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
        };
    }
}
