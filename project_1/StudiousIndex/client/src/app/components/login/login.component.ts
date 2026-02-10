import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  isLoading = false;
  
  authService = inject(AuthService);
  router = inject(Router);

  login() {
    this.isLoading = true;
    this.error = '';
    
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        console.log('Login response', res);
        const role = this.authService.getUserRole();
        console.log('Stored role:', role);
        console.log('Token:', this.authService.getToken());
        if (role === 'Teacher') {
          this.router.navigate(['/teacher/dashboard']);
        } else if (role === 'Admin') {
          this.router.navigate(['/admin']);
        } else if (role === 'Student') {
          this.router.navigate(['/student/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Login error:', err);
        if (err.error && (err.error.message || err.error.Message)) {
            this.error = err.error.message || err.error.Message;
        } else if (err.status === 401) {
            this.error = 'Invalid email or password.';
        } else {
            this.error = `Login failed. Status: ${err.status}. Server error or network issue.`;
        }
        this.isLoading = false;
      }
    });
  }
}
