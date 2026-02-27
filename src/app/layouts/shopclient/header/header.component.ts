import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-shop-client-header',
    standalone: true,
    imports: [RouterModule, CommonModule, MaterialModule],
    templateUrl: './header.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class ShopClientHeaderComponent {
    constructor(private authService: AuthService, private router: Router) { }

    logout() {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}
