import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-client-header',
    standalone: true,
    imports: [
        MatToolbarModule,
        MatButtonModule,
        RouterModule,
        CommonModule,
        MatIconModule
    ],
    templateUrl: './header.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class ClientHeaderComponent { }
