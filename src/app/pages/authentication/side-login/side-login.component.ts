import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, MatButtonModule],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {

  // On injecte le service dans le constructeur
  constructor(private router: Router, private authService: AuthService) { }

  form = new FormGroup({
    // Remplace 'uname' par 'email' pour correspondre à ton backend
    email: new FormControl('admin@gmail.com', [Validators.required, Validators.email]),
    password: new FormControl('admin', [Validators.required]),
  });

  submit() {
    if (this.form.valid) {
      // On envoie les valeurs du formulaire (email et password)
      this.authService.login(this.form.value).subscribe({
        next: (res) => {
          console.log('Login réussi !', res);
          // Le token est déjà sauvegardé par le "tap" dans ton service
          this.router.navigate(['/admin/dashboard']); // Redirige vers ta page d'accueil
        },
        error: (err) => {
          console.error('Erreur de login', err);
          alert('Email ou mot de passe incorrect');
        }
      });
    }
  }


}