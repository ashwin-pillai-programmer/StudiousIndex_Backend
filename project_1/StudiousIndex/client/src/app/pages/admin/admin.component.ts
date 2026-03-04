import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environments';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  stats: { totalUsers?: number; totalExams?: number; totalAttempts?: number } = {};
  allExams: any[] = [];
  pendingExams: any[] = [];
  reportAttempts: any[] = [];
  examsLoading = true;
  reportsLoading = true;

  constructor(
    private http: HttpClient,
    private adminService: AdminService
  ) {}

  get recentExams() {
    return (this.allExams || []).slice(0, 5);
  }

  get recentActivity() {
    return (this.reportAttempts || []).slice(0, 5);
  }

  ngOnInit() {
    this.adminService.getDashboardStats().subscribe({
      next: (data) => { this.stats = data; },
      error: () => {}
    });
    this.fetchExams();
    this.fetchReportAttempts();
  }

  timeAgo(dateStr: string | Date): string {
    if (!dateStr) return '—';
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const now = new Date();
    const sec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (sec < 60) return 'Just now';
    if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)} hours ago`;
    if (sec < 604800) return `${Math.floor(sec / 86400)} days ago`;
    return date.toLocaleDateString();
  }

  fetchExams() {
    this.examsLoading = true;
    this.http.get<any[]>(`${environment.apiUrl}/exam`).subscribe({
      next: (data) => {
        this.allExams = data || [];
        this.pendingExams = this.allExams.filter(e => !e.isApproved);
        this.examsLoading = false;
      },
      error: () => { this.examsLoading = false; }
    });
  }

  fetchReportAttempts() {
    this.reportsLoading = true;
    this.http.get<any[]>(`${environment.apiUrl}/admin/attempts`).subscribe({
      next: (data) => {
        this.reportAttempts = data || [];
        this.reportsLoading = false;
      },
      error: () => { this.reportsLoading = false; }
    });
  }
}
