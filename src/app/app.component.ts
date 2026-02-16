import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ShopDashboardComponent } from './pages/shop-dashboard/shop-dashboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ShopDashboardComponent], // <-- include your standalone component here
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'Modernize Angular Admin Template';
}
