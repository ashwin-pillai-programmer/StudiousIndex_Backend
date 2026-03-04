import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environments';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-teacher-exams',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="fw-bold text-primary">Exam Management</h1>
        <button class="btn btn-primary" (click)="showCreateForm = !showCreateForm">
          {{ showCreateForm ? 'Back to List' : 'Create New Exam' }}
        </button>
      </div>

      <!-- Create Exam Form -->
      <div *ngIf="showCreateForm" class="card p-4 shadow-sm border-0 mb-4 animate-in">
        <h3 class="fw-bold mb-4">New Exam Details</h3>
        <form (ngSubmit)="createExam()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-bold">Exam Title</label>
              <input type="text" class="form-control" [(ngModel)]="newExam.title" name="title" required placeholder="e.g. Unit Test - Physics">
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold">Grade/Class</label>
              <select class="form-select" [(ngModel)]="newExam.grade" name="grade" required>
                <option value="">Select Grade</option>
                <option *ngFor="let level of classLevels" [value]="level">{{level}}</option>
                <option *ngFor="let course of courses" [value]="course">{{course}}</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold">Board</label>
              <input type="text" class="form-control" [(ngModel)]="newExam.board" name="board" placeholder="e.g. CBSE">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold">Scheduled Date & Time</label>
              <input type="datetime-local" class="form-control" [(ngModel)]="newExam.scheduledDate" name="scheduledDate" required>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold">Duration (Minutes)</label>
              <input type="number" class="form-control" [(ngModel)]="newExam.durationMinutes" name="duration" required min="1">
            </div>
            <div class="col-12">
              <label class="form-label fw-bold">Description</label>
              <textarea class="form-control" [(ngModel)]="newExam.description" name="description" rows="2"></textarea>
            </div>
          </div>

          <!-- Questions Section -->
          <div class="mt-4 border-top pt-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="fw-bold mb-0">Questions</h4>
              <button type="button" class="btn btn-sm btn-outline-primary" (click)="addQuestion()">
                <i class="bi bi-plus-lg"></i> Add Question
              </button>
            </div>

            <div *ngFor="let q of newExam.questions; let qi = index" class="card p-3 mb-3 border bg-light">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <span class="badge bg-primary">Question {{qi + 1}}</span>
                <button type="button" class="btn btn-sm btn-outline-danger border-0" (click)="removeQuestion(qi)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
              <div class="mb-3">
                <input type="text" class="form-control" [(ngModel)]="q.text" [name]="'q-text-'+qi" placeholder="Enter question text..." required>
              </div>
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="small fw-bold">Marks</label>
                  <input type="number" class="form-control form-control-sm" [(ngModel)]="q.marks" [name]="'q-marks-'+qi" min="1">
                </div>
              </div>
              
              <!-- Options -->
              <div class="mt-3 bg-white p-3 rounded shadow-sm border">
                <label class="small fw-bold d-block mb-2">Options (Select the correct one)</label>
                <div *ngFor="let opt of q.options; let oi = index" class="input-group mb-2">
                  <div class="input-group-text bg-white border-end-0">
                    <input class="form-check-input mt-0" type="radio" [name]="'correct-'+qi" [checked]="opt.isCorrect" (change)="setCorrect(qi, oi)">
                  </div>
                  <input type="text" class="form-control border-start-0" [(ngModel)]="opt.text" [name]="'opt-'+qi+'-'+oi" placeholder="Option {{oi + 1}}" required>
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-light" (click)="showCreateForm = false">Cancel</button>
            <button type="submit" class="btn btn-primary px-5" [disabled]="submitting">
              {{ submitting ? 'Saving...' : 'Create Exam' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Exam List -->
      <div *ngIf="!showCreateForm" class="card p-4 shadow-sm border-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Exam Details</th>
                <th>Scheduled</th>
                <th>Duration</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loading">
                <td colspan="5" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status"></div>
                </td>
              </tr>
              <tr *ngIf="!loading && exams.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">No exams created yet.</td>
              </tr>
              <tr *ngFor="let exam of exams">
                <td>
                  <div class="fw-bold">{{exam.title}}</div>
                  <small class="text-muted">{{exam.grade}} | {{exam.board}}</small>
                </td>
                <td>
                  <div class="small">{{exam.scheduledDate | date:'mediumDate'}}</div>
                  <div class="small text-muted">{{exam.scheduledDate | date:'shortTime'}}</div>
                </td>
                <td>{{exam.durationMinutes}} mins</td>
                <td>
                  <span class="badge" [class.bg-success]="exam.isApproved" [class.bg-warning]="!exam.isApproved">
                    {{exam.isApproved ? 'Approved' : 'Pending Approval'}}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-danger border-0" (click)="deleteExam(exam.id)">
                    <i class="bi bi-trash"></i> Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; }
    .card { border-radius: 12px; }
    .animate-in { animation: fadeIn 0.3s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class TeacherExamsComponent implements OnInit {
  exams: any[] = [];
  loading = true;
  submitting = false;
  showCreateForm = false;

  classLevels = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  courses = ['BSc Computer Science', 'BSc Physics', 'BSc Mathematics', 'BSc Chemistry', 'BSc IT'];

  newExam: any = {
    title: '',
    description: '',
    durationMinutes: 60,
    grade: '',
    board: '',
    scheduledDate: '',
    questions: [
      {
        text: '',
        marks: 5,
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ]
      }
    ]
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchExams();
  }

  fetchExams() {
    this.loading = true;
    this.http.get<any[]>(`${environment.apiUrl}/exam`).subscribe({
      next: (data) => {
        this.exams = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching exams:', err);
        this.loading = false;
      }
    });
  }

  addQuestion() {
    this.newExam.questions.push({
      text: '',
      marks: 5,
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    });
  }

  removeQuestion(index: number) {
    if (this.newExam.questions.length > 1) {
      this.newExam.questions.splice(index, 1);
    }
  }

  setCorrect(qi: number, oi: number) {
    this.newExam.questions[qi].options.forEach((o: any, i: number) => o.isCorrect = i === oi);
  }

  createExam() {
    this.submitting = true;
    this.http.post(`${environment.apiUrl}/exam`, this.newExam).subscribe({
      next: () => {
        this.submitting = false;
        this.showCreateForm = false;
        this.fetchExams();
        this.resetForm();
      },
      error: (err) => {
        console.error('Error creating exam:', err);
        this.submitting = false;
      }
    });
  }

  deleteExam(id: number) {
    if (confirm('Are you sure you want to delete this exam?')) {
      this.http.delete(`${environment.apiUrl}/exam/${id}`).subscribe({
        next: () => this.fetchExams(),
        error: (err) => console.error('Error deleting exam:', err)
      });
    }
  }

  resetForm() {
    this.newExam = {
      title: '',
      description: '',
      durationMinutes: 60,
      grade: '',
      board: '',
      scheduledDate: '',
      questions: [
        {
          text: '',
          marks: 5,
          options: [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ]
        }
      ]
    };
  }
}
