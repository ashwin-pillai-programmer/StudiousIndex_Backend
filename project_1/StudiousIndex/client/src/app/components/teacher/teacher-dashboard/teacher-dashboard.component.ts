import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TeacherService, TeacherDashboardStats, TeacherExamList } from '../../../services/teacher.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h2>Teacher Dashboard</h2>
      
      <!-- Stats Cards -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card text-white bg-primary mb-3">
            <div class="card-body">
              <h5 class="card-title">Total Exams</h5>
              <p class="card-text display-4">{{ stats?.totalExams || 0 }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-success mb-3">
            <div class="card-body">
              <h5 class="card-title">Approved</h5>
              <p class="card-text display-4">{{ stats?.approvedExams || 0 }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-warning mb-3">
            <div class="card-body">
              <h5 class="card-title">Pending</h5>
              <p class="card-text display-4">{{ stats?.pendingExams || 0 }}</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-info mb-3">
            <div class="card-body">
              <h5 class="card-title">Student Attempts</h5>
              <p class="card-text display-4">{{ stats?.totalStudentsAttempted || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-3">
        <a routerLink="/teacher/exams/create" class="btn btn-primary me-2">Create New Exam</a>
        <a routerLink="/teacher/monitoring" class="btn btn-secondary">View Monitoring</a>
      </div>

      <!-- Recent Exams List -->
      <div class="card">
        <div class="card-header">My Exams</div>
        <div class="card-body">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Title</th>
                <th>Grade/Board</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let exam of exams">
                <td>{{ exam.title }}</td>
                <td>{{ exam.grade }} / {{ exam.board }}</td>
                <td>{{ exam.scheduledDate | date:'medium' }}</td>
                <td>
                  <span [ngClass]="{
                    'badge bg-success': exam.status === 'Approved',
                    'badge bg-warning': exam.status === 'Pending',
                    'badge bg-danger': exam.status === 'Rejected'
                  }">{{ exam.status }}</span>
                </td>
                <td>
                  <button *ngIf="exam.status === 'Pending'" 
                          [routerLink]="['/teacher/exams/edit', exam.id]" 
                          class="btn btn-sm btn-info me-1">Edit</button>
                  <button *ngIf="exam.status === 'Pending'" 
                          (click)="deleteExam(exam.id)" 
                          class="btn btn-sm btn-danger">Delete</button>
                </td>
              </tr>
              <tr *ngIf="exams.length === 0">
                <td colspan="5" class="text-center">No exams found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class TeacherDashboardComponent implements OnInit {
  teacherService = inject(TeacherService);
  stats: TeacherDashboardStats | null = null;
  exams: TeacherExamList[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.teacherService.getDashboardStats().subscribe(data => this.stats = data);
    this.teacherService.getExams().subscribe(data => this.exams = data);
  }

  deleteExam(id: number) {
    if (confirm('Are you sure you want to delete this exam?')) {
      this.teacherService.deleteExam(id).subscribe(() => {
        this.loadData();
      });
    }
  }
}
