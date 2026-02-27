import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClientFooterComponent } from '../client/footer/footer.component';
import { ShopClientHeaderComponent } from './header/header.component';

@Component({
    selector: 'app-shop-client-layout',
    standalone: true,
    imports: [
        RouterModule,
        ShopClientHeaderComponent,
        ClientFooterComponent,
        CommonModule
    ],
    templateUrl: './shopclient.component.html',
})
export class ShopClientComponent { }
