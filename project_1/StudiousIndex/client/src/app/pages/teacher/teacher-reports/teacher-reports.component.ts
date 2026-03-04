import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-teacher-reports',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="fw-bold text-primary mb-0">Student Report Cards</h2>
        <a routerLink="/teacher" class="btn btn-outline-secondary">Back to Dashboard</a>
      </div>

      <div class="card shadow-sm border-0">
        <div class="card-body">
          <div class="row g-4">
            <div class="col-lg-7">
              <h5 class="fw-bold mb-3">Completed Attempts</h5>
              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>Student</th>
                      <th>Exam</th>
                      <th>Date</th>
                      <th>Score</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngIf="loadingAttempts">
                      <td colspan="5" class="text-center py-4">
                        <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                        <span class="ms-2">Loading attempts...</span>
                      </td>
                    </tr>
                    <tr *ngIf="!loadingAttempts && attempts.length === 0">
                      <td colspan="5" class="text-center py-4 text-muted">
                        No completed attempts found for your exams.
                      </td>
                    </tr>
                    <tr *ngFor="let attempt of attempts">
                      <td>{{attempt.studentName}}</td>
                      <td>{{attempt.examTitle}}</td>
                      <td>{{attempt.attemptDate | date:'medium'}}</td>
                      <td>{{attempt.totalMarks}} / {{attempt.maxMarks}}</td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-success"
                                (click)="viewReport(attempt)">
                          View Report
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="col-lg-5">
              <h5 class="fw-bold mb-3">Report Card Details</h5>
              <div *ngIf="selectedReport; else noReport" class="border rounded-3 p-3 bg-light">
                <h4 class="fw-bold mb-1">{{selectedReport.studentName}}</h4>
                <p class="text-muted mb-3">Overall Performance</p>
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <div class="bg-white p-2 rounded-3 text-center">
                      <div class="small text-muted text-uppercase fw-bold">Total Marks</div>
                      <div class="h5 mb-0">{{selectedReport.totalMarks}}</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="bg-white p-2 rounded-3 text-center">
                      <div class="small text-muted text-uppercase fw-bold">Obtained</div>
                      <div class="h5 mb-0">{{selectedReport.obtainedMarks}}</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="bg-white p-2 rounded-3 text-center">
                      <div class="small text-muted text-uppercase fw-bold">Percentage</div>
                      <div class="h5 mb-0">{{selectedReport.percentage | number:'1.0-1'}}%</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="bg-white p-2 rounded-3 text-center">
                      <div class="small text-muted text-uppercase fw-bold">Grade</div>
                      <div class="h5 mb-0">{{selectedReport.grade}}</div>
                    </div>
                  </div>
                </div>
                <div class="mb-2">
                  <span class="badge bg-primary-subtle text-primary me-2">
                    Rank: {{selectedReport.rank}}
                  </span>
                </div>
                <hr>
                <h6 class="fw-bold mb-2">Subject-wise Breakdown</h6>
                <div class="list-group small">
                  <div class="list-group-item d-flex justify-content-between align-items-center"
                       *ngFor="let s of selectedReport.subjects">
                    <div>
                      <div class="fw-semibold">{{s.subject}}</div>
                      <div class="text-muted">
                        {{s.obtainedMarks}} / {{s.totalMarks}} ({{s.percentage | number:'1.0-1'}}%)
                      </div>
                    </div>
                    <span class="badge bg-info text-dark">{{s.grade}}</span>
                  </div>
                </div>
              </div>
              <ng-template #noReport>
                <div class="border rounded-3 p-4 text-center text-muted bg-light">
                  Select a student attempt to view the generated report card.
                  <div class="small mt-2">
                    If you see "No report found" message, ask Admin to generate it.
                  </div>
                </div>
              </ng-template>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; }
  `]
})
export class TeacherReportsComponent implements OnInit {
  attempts: any[] = [];
  loadingAttempts = true;
  selectedReport: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAttempts();
  }

  loadAttempts() {
    this.loadingAttempts = true;
    this.http.get<any[]>(`${environment.apiUrl}/teacher/monitoring`).subscribe({
      next: (data) => {
        this.attempts = data;
        this.loadingAttempts = false;
      },
      error: (err) => {
        console.error('Error loading attempts for teacher reports:', err);
        this.loadingAttempts = false;
      }
    });
  }

  viewReport(attempt: any) {
    if (!attempt?.studentId) {
      return;
    }
    this.http.get<any>(`${environment.apiUrl}/report/${attempt.studentId}`).subscribe({
      next: (report) => {
        this.selectedReport = report;
      },
      error: (err) => {
        if (err.status === 404) {
          alert('No report found for this student yet. Please ask Admin to generate it.');
        } else {
          console.error('Error loading report for teacher:', err);
          alert('Failed to load report card.');
        }
      }
    });
  }
}

