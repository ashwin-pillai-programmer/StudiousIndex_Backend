import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DashboardStats, StatCard, QuickAction } from '../../../models/dashboard.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats | null = null;
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadDashboardStats();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardStats() {
    this.loading = true;
    this.error = null;
    
    this.adminService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Dashboard stats error:', err);
          this.error = 'Unable to load dashboard statistics. Please try again.';
          this.loading = false;
        }
      });
  }

  getStatCards(): StatCard[] {
    if (!this.stats) return [];

    return [
      {
        title: 'Total Users',
        value: this.stats.totalUsers,
        subtitle: `${this.stats.totalStudents} Students · ${this.stats.totalTeachers} Teachers`,
        icon: 'bi-people-fill',
        colorClass: 'primary',
        link: '/admin/users',
        linkText: 'Manage Users'
      },
      {
        title: 'Total Students',
        value: this.stats.totalStudents,
        subtitle: 'Enrolled students',
        icon: 'bi-person-badge-fill',
        colorClass: 'success',
        link: '/admin/users',
        linkText: 'View Students'
      },
      {
        title: 'Total Exams',
        value: this.stats.totalExams,
        subtitle: 'Created by teachers',
        icon: 'bi-file-earmark-text-fill',
        colorClass: 'info',
        link: '/admin/exams',
        linkText: 'Manage Exams'
      },
      {
        title: 'Total Attempts',
        value: this.stats.totalAttempts,
        subtitle: 'Student submissions',
        icon: 'bi-graph-up-arrow',
        colorClass: 'warning',
        link: '/admin/monitoring',
        linkText: 'View Monitoring'
      }
    ];
  }

  getQuickActions(): QuickAction[] {
    return [
      {
        label: 'View All Users',
        icon: 'bi-people',
        route: '/admin/users',
        colorClass: 'primary'
      },
      {
        label: 'Manage Exams',
        icon: 'bi-file-earmark-text',
        route: '/admin/exams',
        colorClass: 'success'
      },
      {
        label: 'Monitor Attempts',
        icon: 'bi-graph-up',
        route: '/admin/monitoring',
        colorClass: 'info'
      }
    ];
  }
}
