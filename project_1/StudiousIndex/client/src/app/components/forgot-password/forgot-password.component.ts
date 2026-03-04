import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {
  step: number = 1;
  mobile: string = '';
  otp: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  
  error: string = '';
  success: string = '';
  devOtp: string = ''; // For development mode only
  
  private apiUrl = `${environment.apiUrl}/Auth`;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }

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
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('StudiousIndex OTP', {
              body: `Your OTP is ${res.otp}. Valid for 2 minutes.`,
              icon: '/assets/icons/icon-72x72.png'
            });
          }
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
        this.success = 'Password reset successful. Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to reset password. Please try again.';
      }
    });
  }
}
