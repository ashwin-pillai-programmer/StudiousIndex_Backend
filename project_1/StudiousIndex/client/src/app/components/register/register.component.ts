import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  role = 'Admin'; // Default for first-time admin registration
  rollNumber = '';
  dateOfBirth = '';
  collegeName = '';
  error = '';
  isLoading = false;
  showPassword = false;

  authService = inject(AuthService);
  router = inject(Router);

  register() {
    this.isLoading = true;
    this.error = '';
    
    const data = { 
      fullName: this.fullName, 
      email: this.email, 
      password: this.password, 
      role: this.role,
      rollNumber: this.role === 'Student' ? this.rollNumber : '',
      dateOfBirth: this.dateOfBirth,
      collegeName: this.collegeName
    };
    this.authService.register(data).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration error:', err);
        if (Array.isArray(err.error)) {
          // Identity errors (array of objects with description)
          this.error = err.error.map((e: any) => e.description).join(' ');
        } else if (err.error && typeof err.error === 'object') {
            if (err.error.message || err.error.Message) {
              // Manual error object (handle both lowercase and uppercase)
              this.error = err.error.message || err.error.Message;
              // Append details if available (e.g. from Identity)
              if (err.error.errors && Array.isArray(err.error.errors)) {
                  this.error += ': ' + err.error.errors.join(' ');
              }
            } else if (err.error.errors) {
            // Validation errors (sometimes wrapped in 'errors' property)
            const messages = [];
            for (const key in err.error.errors) {
              if (err.error.errors.hasOwnProperty(key)) {
                messages.push(...err.error.errors[key]);
              }
            }
            this.error = messages.join(' ');
          } else {
            // ModelState dictionary directly
             const messages = [];
            for (const key in err.error) {
               if (Object.prototype.hasOwnProperty.call(err.error, key)) {
                 const val = err.error[key];
                 if (Array.isArray(val)) {
                   messages.push(...val);
                 } else {
                   messages.push(val);
                 }
               }
            }
            this.error = messages.length > 0 ? messages.join(' ') : 'Registration failed.';
          }
        } else {
          this.error = 'Registration failed. Please try again.';
        }
        this.isLoading = false;
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
