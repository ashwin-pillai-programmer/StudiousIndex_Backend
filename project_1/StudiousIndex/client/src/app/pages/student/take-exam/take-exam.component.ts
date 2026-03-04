import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-take-exam',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container mt-4 mb-5" 
         (contextmenu)="onContextMenu($event)">
      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">Loading exam details...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="alert alert-danger shadow-sm border-0">
        <h4 class="alert-heading fw-bold">Error</h4>
        <p>{{error}}</p>
        <hr>
        <button class="btn btn-outline-danger" routerLink="/student">Back to Dashboard</button>
      </div>

      <!-- Exam Active State -->
      <div *ngIf="!loading && !error && exam && !submitted" class="animate-in">
        <div class="card shadow-sm border-0 mb-4 sticky-top bg-white py-3 px-4 z-index-1000" style="top: 10px;">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div class="d-flex align-items-center gap-2">
                <h2 class="fw-bold mb-0 text-primary">{{exam.title}}</h2>
                <span *ngIf="isPractice" class="badge bg-info text-dark">Practice Mode</span>
              </div>
              <small class="text-muted">Total Questions: {{exam.questions.length}}</small>
            </div>
            <div class="d-flex align-items-center gap-4">
              <div class="text-center">
                <div class="small fw-bold text-muted text-uppercase ls-1">Time Remaining</div>
                <div class="h3 mb-0 fw-bold" [class.text-danger]="timeRemaining < 300">
                  {{ formatTime(timeRemaining) }}
                </div>
              </div>
              <button class="btn btn-primary px-4 py-2 fw-bold shadow-sm" (click)="confirmSubmit()">
                Submit Exam
              </button>
            </div>
          </div>
          <div class="progress mt-3" style="height: 6px;">
            <div class="progress-bar" role="progressbar" 
                 [style.width.%]="(answeredCount / exam.questions.length) * 100"
                 [attr.aria-valuenow]="(answeredCount / exam.questions.length) * 100" 
                 aria-valuemin="0" aria-valuemax="100"></div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Question Navigation (Sidebar) -->
          <div class="col-lg-3">
            <div class="card border-0 shadow-sm p-3 sticky-top" style="top: 120px;">
              <h5 class="fw-bold mb-3">Questions</h5>
              <div class="d-flex flex-wrap gap-2">
                <button *ngFor="let q of exam.questions; let i = index" 
                        class="btn nav-btn" 
                        [class.btn-primary]="currentQuestionIndex === i"
                        [class.btn-outline-secondary]="currentQuestionIndex !== i && !userAnswers[q.id]"
                        [class.btn-success]="currentQuestionIndex !== i && userAnswers[q.id]"
                        (click)="currentQuestionIndex = i">
                  {{i + 1}}
                </button>
              </div>
              <hr>
              <div class="small">
                <div class="d-flex align-items-center mb-1">
                  <span class="badge bg-success me-2">&nbsp;</span> Answered
                </div>
                <div class="d-flex align-items-center mb-1">
                  <span class="badge bg-white border border-secondary me-2">&nbsp;</span> Unanswered
                </div>
                <div class="d-flex align-items-center">
                  <span class="badge bg-primary me-2">&nbsp;</span> Current
                </div>
              </div>
            </div>
          </div>

          <!-- Question Display -->
          <div class="col-lg-9">
            <div class="card border-0 shadow-sm p-4 animate-in" *ngIf="exam.questions[currentQuestionIndex] as q">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <span class="badge bg-primary-subtle text-primary fs-6 px-3 py-2">Question {{currentQuestionIndex + 1}} of {{exam.questions.length}}</span>
                <span class="text-muted fw-bold">{{q.marks}} Marks</span>
              </div>
              
              <h4 class="fw-bold mb-4">{{q.text}}</h4>

              <div class="options-list d-grid gap-3">
                <div *ngFor="let opt of q.options" 
                     class="option-item card border-2 p-3 cursor-pointer"
                     [class.border-primary]="userAnswers[q.id] === opt.id"
                     [class.bg-primary-subtle]="userAnswers[q.id] === opt.id"
                     (click)="selectOption(q.id, opt.id)">
                  <div class="form-check m-0">
                    <input class="form-check-input" type="radio" 
                           [name]="'question-' + q.id" 
                           [id]="'opt-' + opt.id"
                           [checked]="userAnswers[q.id] === opt.id">
                    <label class="form-check-label fw-semibold cursor-pointer w-100 ps-2" [for]="'opt-' + opt.id">
                      {{opt.text}}
                    </label>
                  </div>
                </div>
              </div>

              <div class="d-flex justify-content-between mt-5">
                <button class="btn btn-outline-secondary px-4 py-2" 
                        [disabled]="currentQuestionIndex === 0"
                        (click)="currentQuestionIndex = currentQuestionIndex - 1">
                  <i class="bi bi-chevron-left"></i> Previous
                </button>
                <button class="btn btn-primary px-4 py-2" 
                        *ngIf="currentQuestionIndex < exam.questions.length - 1"
                        (click)="currentQuestionIndex = currentQuestionIndex + 1">
                  Next <i class="bi bi-chevron-right"></i>
                </button>
                <button class="btn btn-success px-4 py-2" 
                        *ngIf="currentQuestionIndex === exam.questions.length - 1"
                        (click)="confirmSubmit()">
                  Finish & Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Result State -->
      <div *ngIf="submitted && result" class="animate-in text-center py-5">
        <div class="card shadow border-0 p-5 max-width-600 mx-auto">
          <div class="result-icon mb-4">
            <i class="bi" [class.bi-check-circle-fill]="result.isPassed" [class.text-success]="result.isPassed"
                       [class.bi-x-circle-fill]="!result.isPassed" [class.text-danger]="!result.isPassed"
               style="font-size: 5rem;"></i>
          </div>
          <h1 class="fw-bold mb-2">{{ result.isPassed ? 'Congratulations!' : 'Better Luck Next Time!' }}</h1>
          <p class="lead text-muted mb-4">
            You have completed the <strong>{{exam.title}}</strong>
            <span *ngIf="isPractice" class="d-block text-info fw-bold mt-1">(Practice Session - Marks not counted in records)</span>
          </p>
          
          <div class="row g-3 mb-4">
            <div class="col-6">
              <div class="bg-light p-3 rounded-3">
                <div class="small text-muted text-uppercase fw-bold">Your Score</div>
                <div class="h2 fw-bold mb-0">{{result.score}} / {{result.totalMarks}}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="bg-light p-3 rounded-3">
                <div class="small text-muted text-uppercase fw-bold">Percentage</div>
                <div class="h2 fw-bold mb-0">{{ (result.score / result.totalMarks * 100) | number:'1.0-1' }}%</div>
              </div>
            </div>
          </div>

          <div class="d-flex gap-3 justify-content-center">
            <button class="btn btn-primary px-4" routerLink="/student">Back to Dashboard</button>
            <button class="btn btn-outline-secondary px-4" (click)="viewDetails(result.attemptId)">View Detailed Review</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1100px; }
    .animate-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .ls-1 { letter-spacing: 1px; }
    .z-index-1000 { z-index: 1000; }
    .nav-btn { width: 40px; height: 40px; padding: 0; display: flex; align-items: center; justify-content: center; font-weight: bold; border-radius: 8px; }
    .cursor-pointer { cursor: pointer; }
    .option-item { transition: all 0.2s; border-radius: 12px; border-width: 2px !important; }
    .option-item:hover { border-color: #0d6efd; background-color: #f8f9ff; }
    .max-width-600 { max-width: 600px; }
    .bg-primary-subtle { background-color: #e7f1ff; }
  `]
})
export class TakeExamComponent implements OnInit, OnDestroy {
  exam: any = null;
  loading = true;
  error = '';
  submitted = false;
  result: any = null;
  attemptId: number = 0;
  isPractice: boolean = false;
  
  currentQuestionIndex = 0;
  userAnswers: { [key: number]: number } = {};
  timeRemaining = 0; // in seconds
  timerHandle: any = null;
  private hasAutoSubmitted = false;
  
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const examId = this.route.snapshot.paramMap.get('id');
    this.isPractice = this.route.snapshot.queryParamMap.get('mode') === 'practice';
    
    if (examId) {
      this.startExam(parseInt(examId));
    } else {
      this.error = 'Invalid Exam ID';
      this.loading = false;
    }

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleWindowBlur);
  }

  ngOnDestroy() {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
    }
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleWindowBlur);
  }

  startExam(id: number) {
    this.loading = true;
    // 1. First notify backend that we are starting the exam
    const url = `${environment.apiUrl}/exam/${id}/start${this.isPractice ? '?isPractice=true' : ''}`;
    this.http.post<any>(url, {}).subscribe({
      next: (startRes) => {
        this.attemptId = startRes.attemptId;
        
        // 2. Fetch the exam details
        this.http.get<any>(`${environment.apiUrl}/exam/${id}`).subscribe({
          next: (examData) => {
            this.exam = examData;
            this.timeRemaining = examData.durationMinutes * 60;
            this.startTimer();
            this.loading = false;
          },
          error: (err) => {
            console.error('Error fetching exam details:', err);
            this.error = 'Could not load exam details. Please try again.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error starting exam:', err);
        if (err.status === 400 && err.error) {
          this.error = typeof err.error === 'string' ? err.error : err.error.message || 'Exam is unavailable.';
        } else {
          this.error = 'Could not start exam. You might have already completed it or it is unavailable.';
        }
        this.loading = false;
      }
    });
  }

  startTimer() {
    this.timerHandle = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.submitExam();
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  }

  selectOption(questionId: number, optionId: number) {
    this.userAnswers[questionId] = optionId;
  }

  get answeredCount(): number {
    return Object.keys(this.userAnswers).length;
  }

  confirmSubmit() {
    const remaining = this.exam.questions.length - this.answeredCount;
    let message = 'Are you sure you want to submit your exam?';
    if (remaining > 0) {
      message = `You have ${remaining} unanswered questions. Are you sure you want to submit?`;
    }

    if (confirm(message)) {
      this.submitExam();
    }
  }

  submitExam() {
    if (this.submitted || this.loading) {
      return;
    }
    if (this.timerHandle) clearInterval(this.timerHandle);
    
    this.loading = true;
    const submission = {
      attemptId: this.attemptId,
      isPractice: this.isPractice,
      answers: Object.keys(this.userAnswers).map(qId => ({
        questionId: parseInt(qId),
        selectedOptionId: this.userAnswers[parseInt(qId)]
      }))
    };

    this.http.post<any>(`${environment.apiUrl}/exam/${this.exam.id}/submit`, submission).subscribe({
      next: (res) => {
        this.result = res;
        this.submitted = true;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error submitting exam:', err);
        this.error = 'There was an error submitting your exam. Please contact support.';
        this.loading = false;
      }
    });
  }

  private handleVisibilityChange = () => {
    if (document.hidden && !this.hasAutoSubmitted && !this.submitted) {
      this.hasAutoSubmitted = true;
      this.submitExam();
    }
  };

  private handleWindowBlur = () => {
    if (!this.hasAutoSubmitted && !this.submitted) {
      this.hasAutoSubmitted = true;
      this.submitExam();
    }
  };

  onContextMenu(event: MouseEvent) {
    event.preventDefault();
    if (!this.hasAutoSubmitted && !this.submitted) {
      this.hasAutoSubmitted = true;
      this.submitExam();
    }
  }

  viewDetails(attemptId: number) {
    alert('Review feature is coming soon! You scored ' + this.result.score + ' marks.');
    this.router.navigate(['/student']);
  }
}
