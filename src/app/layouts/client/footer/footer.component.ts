import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-client-footer',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatIconModule
    ],
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class ClientFooterComponent {
    currentYear: number = new Date().getFullYear();
}