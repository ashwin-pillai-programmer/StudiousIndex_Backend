import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="si-dashboard-layout">
      <aside class="si-dashboard-sidebar">
        <h2 class="si-sidebar-title">Student Panel</h2>
        <p class="si-sidebar-subtitle">Attempt exams, practice freely, watch lectures</p>
        <nav class="si-sidebar-nav">
          <button class="si-sidebar-link" (click)="scrollTo('student-overview')">
            <span class="si-sidebar-link-icon"><i class="bi bi-speedometer2"></i></span>
            <span>Overview</span>
          </button>

          <div class="si-sidebar-section-label">Exams</div>
          <button class="si-sidebar-link" (click)="scrollTo('exams')">
            <span class="si-sidebar-link-icon"><i class="bi bi-journal-text"></i></span>
            <span>Available Exams</span>
          </button>
          <button class="si-sidebar-link" (click)="scrollTo('practice')">
            <span class="si-sidebar-link-icon"><i class="bi bi-controller"></i></span>
            <span>Practice Sessions</span>
          </button>

          <div class="si-sidebar-section-label">Learning</div>
          <button class="si-sidebar-link" (click)="scrollTo('student-videos')">
            <span class="si-sidebar-link-icon"><i class="bi bi-play-circle"></i></span>
            <span>Video Lectures</span>
          </button>
        </nav>
        <div class="si-sidebar-footer">
          Scroll through each section while explaining to coordinators.
        </div>
      </aside>

      <main class="si-dashboard-main">
    <div class="container mt-4" id="student-overview">
      <!-- Dashboard Stats -->
      <div class="card p-4 shadow-sm border-0 mb-4 bg-light">
        <h1 class="fw-bold text-primary">Student Dashboard</h1>
        <p class="lead text-muted">View available exams and your progress.</p>
        <div class="row g-3 mt-2">
          <div class="col-md-6 col-lg-3">
            <div class="card border-0 shadow-sm p-3 h-100 text-center">
              <h5 class="text-muted">Available Exams</h5>
              <p class="h2 fw-bold text-info">{{exams.length}}</p>
              <button class="btn btn-sm btn-outline-info" (click)="scrollTo('exams')">View Exams</button>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="card border-0 shadow-sm p-3 h-100 text-center">
              <h5 class="text-muted">Completed Exams</h5>
              <p class="h2 fw-bold text-secondary">{{completedCount}}</p>
              <button class="btn btn-sm btn-outline-secondary" (click)="scrollTo('practice')">Practice Session</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Exams Section -->
      <div id="exams" class="card p-4 shadow-sm border-0 mb-4">
        <h2 class="fw-bold mb-4">Available Exams</h2>
        <div class="row g-4">
          <div *ngIf="examsLoading" class="col-12 text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Loading exams...</p>
          </div>
          <div *ngIf="!examsLoading && exams.length === 0" class="col-12 text-center py-4 bg-light rounded-3">
            <p class="mb-0 text-muted">No exams available at the moment.</p>
          </div>
          <div *ngFor="let exam of exams" class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 shadow-sm exam-card border-start border-4 border-primary">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <span class="badge bg-primary-subtle text-primary">{{exam.grade}}</span>
                  <span class="badge bg-info-subtle text-info">{{exam.durationMinutes}} mins</span>
                </div>
                <h5 class="card-title fw-bold">{{exam.title}}</h5>
                <p class="card-text text-muted small">{{exam.description}}</p>
                <div class="d-flex align-items-center mt-3 text-muted small">
                  <i class="bi bi-calendar-event me-2"></i>
                  {{exam.scheduledDate | date:'medium'}}
                </div>
              </div>
              <div class="card-footer bg-transparent border-0 pt-0 pb-3">
                <button class="btn btn-primary w-100" (click)="startExam(exam)">Start Exam</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Practice Session Section -->
      <div id="practice" class="card p-4 shadow-sm border-0 mb-4 bg-info-subtle border-info border-top border-4">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h2 class="fw-bold mb-0">Practice Sessions</h2>
            <p class="text-muted mb-0">Re-attempt exams as many times as you want for practice! (Marks are not counted in official records)</p>
          </div>
          <span class="badge bg-info text-dark px-3 py-2 fs-6">{{completedExams.length}} Ready for Practice</span>
        </div>
        
        <div class="row g-4">
          <div *ngIf="!examsLoading && completedExams.length === 0" class="col-12 text-center py-4 bg-white bg-opacity-50 rounded-3">
            <p class="mb-0 text-muted">Complete exams from the "Available Exams" section. They will appear here once an Admin enables them for practice.</p>
          </div>
          <div *ngFor="let exam of completedExams" class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 shadow-sm exam-card border-start border-4 border-info">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <span class="badge bg-info text-dark">{{exam.grade}}</span>
                  <span class="badge bg-white text-info border border-info">{{exam.durationMinutes}} mins</span>
                </div>
                <h5 class="card-title fw-bold">{{exam.title}}</h5>
                <p class="card-text text-muted small">{{exam.description}}</p>
                <div class="alert alert-info py-1 px-2 mb-0 mt-3 small">
                  <i class="bi bi-info-circle me-1"></i> Practice re-attempts allowed.
                </div>
              </div>
              <div class="card-footer bg-transparent border-0 pt-0 pb-3">
                <button class="btn btn-info text-dark fw-bold w-100" (click)="startExam(exam, true)">
                  Start Practice Re-attempt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Video Lectures Section -->
      <div class="card p-4 shadow-sm border-0" id="student-videos">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h2 class="mb-0 fw-bold">Video Lectures</h2>
          
          <!-- Search and Filter Bar -->
          <div class="d-flex gap-2 flex-grow-1 max-width-600">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control border-start-0" placeholder="Search by title..." 
                     [(ngModel)]="searchQuery" (ngModelChange)="fetchVideos()">
            </div>
            <select class="form-select w-auto" [(ngModel)]="selectedClass" (change)="fetchVideos()">
              <option value="">All Classes</option>
              <optgroup label="School">
                <option *ngFor="let level of classLevels" [value]="level">{{level}}</option>
              </optgroup>
              <optgroup label="College">
                <option *ngFor="let course of courses" [value]="course">{{course}}</option>
              </optgroup>
            </select>
          </div>
        </div>

        <hr>

        <!-- Video Grid -->
        <div class="row g-4 mt-2">
          <div *ngIf="loading" class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Loading lectures...</p>
          </div>

          <div *ngIf="!loading && videos.length === 0" class="col-12 text-center py-5 bg-light rounded-3">
            <i class="bi bi-play-circle text-muted display-1"></i>
            <p class="mt-3 fs-5 text-muted">No video lectures found matching your criteria.</p>
          </div>

          <div *ngFor="let video of videos" class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 shadow-sm video-card">
              <div class="video-container">
                <iframe [src]="getSafeUrl(video.videoUrl)" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin"
                        allowfullscreen>
                </iframe>
              </div>
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <span class="badge bg-primary-subtle text-primary px-2 py-1">{{video.classLevel}}</span>
                  <span class="badge bg-secondary-subtle text-secondary px-2 py-1">{{video.subject}}</span>
                </div>
                <h5 class="card-title fw-bold mb-1">{{video.title}}</h5>
                <p class="card-text text-muted small mb-0">
                  <i class="bi bi-calendar3 me-1"></i> {{video.createdAt | date:'mediumDate'}}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      </main>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; }
    .max-width-600 { max-width: 600px; }
    .video-card {
      transition: transform 0.2s;
      overflow: hidden;
      border-radius: 12px;
    }
    .video-card:hover {
      transform: translateY(-5px);
    }
    .video-container {
      position: relative;
      padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
      height: 0;
      overflow: hidden;
    }
    .video-container iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  `]
})
export class StudentComponent implements OnInit {
  videos: any[] = [];
  exams: any[] = [];
  completedExams: any[] = [];
  completedCount = 0;
  loading = true;
  examsLoading = true;
  searchQuery = '';
  selectedClass = '';

  classLevels = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 
    'Class 11', 'Class 12'
  ];

  courses = [
    'BSc Computer Science', 'BSc Physics', 'BSc Mathematics', 
    'BSc Chemistry', 'BSc IT'
  ];

  constructor(
    private http: HttpClient, 
    private sanitizer: DomSanitizer, 
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchVideos();
    this.fetchExams();
    this.fetchHistory();
  }

  fetchVideos() {
    this.loading = true;
    let params: any = {};
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.selectedClass) params.classLevel = this.selectedClass;

    this.http.get<any[]>(`${environment.apiUrl}/videolectures`, { params }).subscribe({
      next: (data) => {
        this.videos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching videos:', err);
        this.loading = false;
      }
    });
  }

  fetchExams() {
    this.examsLoading = true;
    this.http.get<any[]>(`${environment.apiUrl}/exam`).subscribe({
      next: (data) => {
        this.exams = data;
        this.fetchPracticeExams();
        this.examsLoading = false;
      },
      error: (err) => {
        console.error('Error fetching exams:', err);
        this.examsLoading = false;
      }
    });
  }

  fetchPracticeExams() {
    this.http.get<any[]>(`${environment.apiUrl}/exam/practice`).subscribe({
      next: (data) => {
        this.completedExams = data;
      },
      error: (err) => {
        console.error('Error fetching practice exams:', err);
      }
    });
  }

  fetchHistory() {
    this.http.get<any[]>(`${environment.apiUrl}/exam/history`).subscribe({
      next: (data) => {
        this.completedCount = data.length;
      },
      error: (err) => {
        console.error('Error fetching history:', err);
      }
    });
  }

  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  startExam(exam: any, isPractice: boolean = false) {
    const mode = isPractice ? 'practice' : 'real';
    const message = isPractice 
      ? `Start practice session for ${exam.title}? Marks will not be recorded.`
      : `Are you sure you want to start ${exam.title}? The timer will start immediately.`;

    if (confirm(message)) {
      this.router.navigate(['/student/take-exam', exam.id], { 
        queryParams: { mode: isPractice ? 'practice' : 'real' } 
      });
    }
  }

  getSafeUrl(videoUrl: string): SafeResourceUrl {
    let videoId = videoUrl;
    
    // Fallback: If for some reason a full URL was stored instead of just the ID, extract it
    if (videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'))) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = videoUrl.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      }
    }
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
  }
}
