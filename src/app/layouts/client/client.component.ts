import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ClientHeaderComponent } from './header/header.component';
import { CommonModule } from '@angular/common';
import { ClientFooterComponent } from './footer/footer.component';

@Component({
    selector: 'app-client-layout',
    standalone: true,
    imports: [
        RouterModule,
        ClientHeaderComponent,
        ClientFooterComponent,
        CommonModule
    ],
    templateUrl: './client.component.html',
})
export class ClientComponent { }
