import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shop-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // <-- add ReactiveFormsModule here
  templateUrl: './shop-login.component.html',
})
export class ShopLoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  submit() {
    console.log('Login button pressed');
    if (!this.loginForm.valid) return;

    this.http.post<any>('http://localhost:5000/api/shop-auth/shop-login', this.loginForm.value)
      .subscribe({
        next: (res) => {
          // Store token and user info
          localStorage.setItem('token', res.token);
          localStorage.setItem('userRole', res.user.role);

          // Navigate to dashboard
          this.router.navigate(['/shop-dashboard']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Login failed';
        }
      });
  }
}
