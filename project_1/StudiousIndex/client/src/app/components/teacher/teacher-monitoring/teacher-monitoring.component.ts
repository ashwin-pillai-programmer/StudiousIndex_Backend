import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherService, TeacherStudentAttempt } from '../../../services/teacher.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-teacher-monitoring',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Student Monitoring</h2>
        <a routerLink="/teacher/dashboard" class="btn btn-secondary">Back to Dashboard</a>
      </div>

      <div class="card">
        <div class="card-body">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Exam Title</th>
                <th>Date Attempted</th>
                <th>Score</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let attempt of attempts">
                <td>{{ attempt.studentName }}</td>
                <td>{{ attempt.examTitle }}</td>
                <td>{{ attempt.attemptDate | date:'medium' }}</td>
                <td>{{ attempt.totalMarks }} / {{ attempt.maxMarks }}</td>
                <td>
                  <div class="progress" style="height: 20px;">
                    <div class="progress-bar" 
                         [ngClass]="getScoreClass(attempt.totalMarks, attempt.maxMarks)"
                         role="progressbar" 
                         [style.width.%]="(attempt.totalMarks / attempt.maxMarks) * 100">
                      {{ ((attempt.totalMarks / attempt.maxMarks) * 100) | number:'1.0-0' }}%
                    </div>
                  </div>
                </td>
              </tr>
              <tr *ngIf="attempts.length === 0">
                <td colspan="5" class="text-center">No attempts found yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class TeacherMonitoringComponent implements OnInit {
  teacherService = inject(TeacherService);
  attempts: TeacherStudentAttempt[] = [];

  ngOnInit() {
    this.teacherService.getMonitoringData().subscribe(data => {
      this.attempts = data;
    });
  }

  getScoreClass(score: number, total: number): string {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-danger';
  }
}
