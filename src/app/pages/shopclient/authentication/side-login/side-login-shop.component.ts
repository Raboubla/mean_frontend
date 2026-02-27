import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../../material.module';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, MatButtonModule],
  templateUrl: './side-login-shop.component.html',
})
export class AppSideLoginShopComponent {

  // On injecte le service dans le constructeur
  constructor(private router: Router, private authService: AuthService) { }

  form = new FormGroup({
    // Remplace 'uname' par 'email' pour correspondre à ton backend
    email: new FormControl('bolo@gmail.com', [Validators.required, Validators.email]),
    password: new FormControl('bolo', [Validators.required]),
  });

  submit() {
    if (this.form.valid) {
      this.authService.loginShop(this.form.value).subscribe({
        next: (res) => {
          console.log('Login réussi !', res);
          this.router.navigate(['/shop-admin']);
        },
        error: (err) => {
          console.error('Erreur de login', err);

          if (err.message === "Erreur de profil") {
            alert("Erreur de profil : accès réservé aux SHOP_ADMIN");
          } else {
            alert("Email ou mot de passe incorrect");
          }
        }
      });
    }
  }



}