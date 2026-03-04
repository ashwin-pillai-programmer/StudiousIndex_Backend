import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

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
  showPassword = false;
  
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  get loginRoleFromRoute(): string {
    const param = (this.route.snapshot.paramMap.get('role') || '').toLowerCase();
    if (param === 'admin' || param === 'teacher' || param === 'student') {
      return param;
    }
    return '';
  }

  get subtitleText(): string {
    const role = this.loginRoleFromRoute;
    if (role === 'admin') {
      return 'Admin login. Please enter your credentials.';
    }
    if (role === 'teacher') {
      return 'Teacher login. Please enter your credentials.';
    }
    if (role === 'student') {
      return 'Student login. Please enter your credentials.';
    }
    return 'Welcome back! Please login to your account.';
  }

  login() {
    this.isLoading = true;
    this.error = '';
    
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        console.log('Login response', res);
        const role = this.authService.getUserRole();
        console.log('Stored role:', role);
        console.log('Token:', this.authService.getToken());
        const routeRole = this.loginRoleFromRoute;
        const normalizedRole = role.toLowerCase();
        if (routeRole === 'admin' && normalizedRole !== 'admin') {
          this.error = 'Please use an Admin account for this login page.';
          this.isLoading = false;
          return;
        }
        if (routeRole === 'teacher' && normalizedRole !== 'teacher') {
          this.error = 'Please use a Teacher account for this login page.';
          this.isLoading = false;
          return;
        }
        if (routeRole === 'student' && normalizedRole !== 'student') {
          this.error = 'Please use a Student account for this login page.';
          this.isLoading = false;
          return;
        }
        if (role === 'Teacher') {
          console.log('[Login] Navigating to /teacher');
          this.router.navigate(['/teacher']);
        } else if (role === 'Admin') {
          console.log('[Login] Navigating to /admin');
          this.router.navigate(['/admin']);
        } else if (role === 'Student') {
          console.log('[Login] Navigating to /student');
          this.router.navigate(['/student']);
        } else {
          console.log('[Login] Navigating to /home (unknown role)');
          this.router.navigate(['/home']);
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
