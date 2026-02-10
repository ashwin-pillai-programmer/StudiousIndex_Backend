import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  step: number = 1;
  mobile: string = '';
  otp: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  
  error: string = '';
  success: string = '';
  devOtp: string = ''; // For development mode only
  
  private apiUrl = 'http://localhost:5131/api/Auth';

  constructor(private router: Router, private http: HttpClient) {}

  sendOtp() {
    this.error = '';
    this.success = '';
    this.devOtp = '';
    
    if (!this.mobile || this.mobile.length < 10) {
      this.error = 'Please enter a valid mobile number.';
      return;
    }

    this.http.post(`${this.apiUrl}/send-otp`, { mobileNumber: this.mobile }).subscribe({
      next: (res: any) => {
        this.step = 2;
        this.success = res.message || `OTP sent successfully to ${this.mobile}.`;
        
        // Handle development mode OTP
        if (res.otp) {
          this.devOtp = res.otp;
          console.log('Development Mode OTP:', res.otp);
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to send OTP. Please try again.';
      }
    });
  }

  verifyOtp() {
    this.error = '';
    this.success = '';

    if (!this.otp || this.otp.length !== 6) {
      this.error = 'Please enter a valid 6-digit OTP.';
      return;
    }

    this.http.post(`${this.apiUrl}/verify-otp`, { mobileNumber: this.mobile, otp: this.otp }).subscribe({
      next: (res: any) => {
        this.step = 3;
        this.success = res.message || 'OTP verified successfully. Please reset your password.';
      },
      error: (err) => {
        this.error = err.error?.message || 'Invalid OTP. Please try again.';
      }
    });
  }

  resetPassword() {
    this.error = '';
    this.success = '';

    if (!this.newPassword || this.newPassword.length < 6) {
      this.error = 'Password must be at least 6 characters long.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.http.post(`${this.apiUrl}/reset-password-otp`, { 
      mobileNumber: this.mobile, 
      otp: this.otp, 
      newPassword: this.newPassword 
    }).subscribe({
      next: (res: any) => {
        this.success = res.message || 'Password reset successfully! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to reset password. Please try again.';
      }
    });
  }
}
