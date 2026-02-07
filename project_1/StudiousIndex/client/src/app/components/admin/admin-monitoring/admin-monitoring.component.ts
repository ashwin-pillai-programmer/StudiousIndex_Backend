import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-monitoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-monitoring.component.html',
  styleUrl: './admin-monitoring.component.css'
})
export class AdminMonitoringComponent implements OnInit {
  attempts: any[] = [];
  loading = true;

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadAttempts();
  }

  loadAttempts() {
    this.loading = true;
    this.adminService.getAttempts().subscribe({
      next: (data) => {
        this.attempts = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
