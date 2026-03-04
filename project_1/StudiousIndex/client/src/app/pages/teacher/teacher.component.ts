import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="si-dashboard-layout">
      <aside class="si-dashboard-sidebar">
        <h2 class="si-sidebar-title">Teacher Panel</h2>
        <p class="si-sidebar-subtitle">Create exams, share lectures, review results</p>
        <nav class="si-sidebar-nav">
          <button class="si-sidebar-link" (click)="scrollTo('teacher-overview')">
            <span class="si-sidebar-link-icon"><i class="bi bi-speedometer2"></i></span>
            <span>Overview</span>
          </button>

          <div class="si-sidebar-section-label">Teaching</div>
          <button class="si-sidebar-link" routerLink="/teacher/exams">
            <span class="si-sidebar-link-icon"><i class="bi bi-journal-text"></i></span>
            <span>My Exams</span>
          </button>
          <button class="si-sidebar-link" routerLink="/teacher/videos">
            <span class="si-sidebar-link-icon"><i class="bi bi-play-circle"></i></span>
            <span>Video Lectures</span>
          </button>

          <div class="si-sidebar-section-label">Results</div>
          <button class="si-sidebar-link" routerLink="/teacher/reports">
            <span class="si-sidebar-link-icon"><i class="bi bi-graph-up-arrow"></i></span>
            <span>Student Reports</span>
          </button>
        </nav>
        <div class="si-sidebar-footer">
          Use this menu to switch between exams, lectures, and reports.
        </div>
      </aside>

      <main class="si-dashboard-main" id="teacher-overview">
      <div class="container mt-4">
      <div class="card p-4 shadow-sm border-0">
        <h1 class="display-5 fw-bold text-primary">Teacher Dashboard</h1>
        <p class="lead text-muted">Create and manage your exams and lectures here.</p>
        <hr class="my-4">
        
        <div class="row g-4 mt-2">
          <!-- My Exams -->
          <div class="col-md-4">
            <div class="card border-primary h-100 p-3 shadow-sm hover-card">
              <div class="d-flex align-items-center mb-3">
                <div class="bg-primary text-white p-3 rounded-3 me-3">
                  <i class="bi bi-journal-text fs-3"></i>
                </div>
                <h3 class="mb-0">My Exams</h3>
              </div>
              <p class="text-muted">Active: 4 | Pending: 2</p>
              <div class="mt-auto">
                <button class="btn btn-outline-primary w-100" routerLink="/teacher/exams">Manage Exams</button>
              </div>
            </div>
          </div>

          <!-- Video Lectures -->
          <div class="col-md-4">
            <div class="card border-info h-100 p-3 shadow-sm hover-card">
              <div class="d-flex align-items-center mb-3">
                <div class="bg-info text-white p-3 rounded-3 me-3">
                  <i class="bi bi-play-circle-fill fs-3"></i>
                </div>
                <h3 class="mb-0">Video Lectures</h3>
              </div>
              <p class="text-muted">Upload and manage lecture videos for students.</p>
              <div class="mt-auto">
                <button class="btn btn-outline-info w-100" routerLink="/teacher/videos">Manage Videos</button>
              </div>
            </div>
          </div>

          <!-- Student Results -->
          <div class="col-md-4">
            <div class="card border-success h-100 p-3 shadow-sm hover-card">
              <div class="d-flex align-items-center mb-3">
                <div class="bg-success text-white p-3 rounded-3 me-3">
                  <i class="bi bi-graph-up-arrow fs-3"></i>
                </div>
                <h3 class="mb-0">Student Results</h3>
              </div>
              <p class="text-muted">View report cards for your students.</p>
              <div class="mt-auto">
                <button class="btn btn-outline-success w-100" routerLink="/teacher/reports">View Report Cards</button>
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
    .card { border-radius: 16px; transition: transform 0.2s, box-shadow 0.2s; }
    .hover-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
    .rounded-3 { border-radius: 12px !important; }
  `]
})
export class TeacherComponent {
  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
