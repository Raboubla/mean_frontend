import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, NgScrollbarModule, MaterialModule, MatButtonModule],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
})

export class HeaderComponent {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) { }

  onLogout() {
    this.authService.logout(); // On vide le localStorage
    this.router.navigate(['/authentication/login']); // On redirige vers le login
  }

  // ... tes autres variables
  showNotifMessage = false;

  triggerNotif() {
    this.showNotifMessage = true;

    // Le message disparaît automatiquement après 3 secondes
    setTimeout(() => {
      this.showNotifMessage = false;
    }, 3000);
  }
}
