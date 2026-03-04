import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environments';

@Component({
  selector: 'app-teacher-videos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <div class="card shadow-sm border-0 rounded-3">
        <div class="card-header bg-primary text-white p-3 rounded-top-3">
          <h3 class="mb-0 fs-4">Upload Video Lecture</h3>
        </div>
        <div class="card-body p-4">
          <!-- Success Message -->
          <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i>
            {{ successMessage }}
            <button type="button" class="btn-close" (click)="successMessage = ''"></button>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            {{ errorMessage }}
            <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
          </div>

          <form (ngSubmit)="onSubmit()" #videoForm="ngForm">
            <div class="row g-4">
              <div class="col-md-7">
                <div class="row g-3">
                  <!-- Title -->
                  <div class="col-md-12">
                    <label for="title" class="form-label">Video Title</label>
                    <input type="text" id="title" name="title" class="form-control" 
                           [(ngModel)]="videoData.title" required #title="ngModel"
                           [class.is-invalid]="title.invalid && title.touched"
                           placeholder="e.g. Introduction to Calculus">
                  </div>

                  <!-- Class Level -->
                  <div class="col-md-6">
                    <label for="classLevel" class="form-label">Class Level / Course</label>
                    <select id="classLevel" name="classLevel" class="form-select" 
                            [(ngModel)]="videoData.classLevel" required>
                      <optgroup label="School">
                        <option *ngFor="let level of classLevels" [value]="level">{{level}}</option>
                      </optgroup>
                      <optgroup label="College">
                        <option *ngFor="let course of courses" [value]="course">{{course}}</option>
                      </optgroup>
                    </select>
                  </div>

                  <!-- Subject -->
                  <div class="col-md-6">
                    <label for="subject" class="form-label">Subject</label>
                    <input type="text" id="subject" name="subject" class="form-control" 
                           [(ngModel)]="videoData.subject" required #subject="ngModel"
                           [class.is-invalid]="subject.invalid && subject.touched"
                           placeholder="e.g. Mathematics, Physics, English">
                  </div>

                  <!-- Video URL -->
                  <div class="col-md-12">
                    <label for="videoUrl" class="form-label">YouTube URL</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light"><i class="bi bi-youtube text-danger"></i></span>
                      <input type="url" id="videoUrl" name="videoUrl" class="form-control" 
                             [(ngModel)]="videoData.videoUrl" required #videoUrl="ngModel"
                             (ngModelChange)="onUrlChange($event)"
                             [class.is-invalid]="videoUrl.invalid && videoUrl.touched"
                             placeholder="https://www.youtube.com/watch?v=VIDEO_ID">
                    </div>
                    <div class="form-text text-muted mt-2">
                      <small>Paste the full link from YouTube. We'll extract the ID and show a preview.</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Preview Section -->
              <div class="col-md-5">
                <label class="form-label">Video Preview</label>
                <div class="preview-container border rounded bg-light d-flex align-items-center justify-content-center overflow-hidden">
                  <ng-container *ngIf="safePreviewUrl; else noPreview">
                    <iframe [src]="safePreviewUrl" 
                            width="100%" 
                            height="200" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                    </iframe>
                  </ng-container>
                  <ng-template #noPreview>
                    <div class="text-center p-4 text-muted">
                      <i class="bi bi-play-btn fs-1 d-block mb-2"></i>
                      <span>Enter a valid YouTube URL to see a preview</span>
                    </div>
                  </ng-template>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="col-md-12 text-end pt-3 border-top mt-4">
                <button type="submit" class="btn btn-primary px-5 shadow-sm" 
                        [disabled]="videoForm.invalid || isSubmitting || !extractedVideoId">
                  <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isSubmitting ? 'Uploading...' : 'Upload Lecture' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1000px; }
    .form-label { font-weight: 600; color: #444; }
    .preview-container { height: 200px; position: relative; }
    .preview-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
    .form-control:focus, .form-select:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1);
    }
  `]
})
export class TeacherVideosComponent {
  videoData = {
    title: '',
    classLevel: 'Class 1',
    subject: '',
    videoUrl: ''
  };

  classLevels = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 
    'Class 11', 'Class 12'
  ];

  courses = [
    'BSc Computer Science', 'BSc Physics', 'BSc Mathematics', 
    'BSc Chemistry', 'BSc IT'
  ];

  extractedVideoId: string | null = null;
  safePreviewUrl: SafeResourceUrl | null = null;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  onUrlChange(url: string) {
    this.extractedVideoId = this.extractVideoId(url);
    if (this.extractedVideoId) {
      const embedUrl = `https://www.youtube.com/embed/${this.extractedVideoId}`;
      this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    } else {
      this.safePreviewUrl = null;
    }
  }

  onSubmit() {
    if (!this.extractedVideoId) return;

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      ...this.videoData,
      videoUrl: this.extractedVideoId // Store only the Video ID in the DB
    };

    this.http.post(`${environment.apiUrl}/videolectures`, payload).subscribe({
      next: () => {
        this.successMessage = 'Your video lecture has been uploaded and is waiting for Admin approval!';
        this.isSubmitting = false;
        this.resetForm();
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.errorMessage = 'There was an error uploading your video. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  private extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  private resetForm() {
    this.videoData = {
      title: '',
      classLevel: 'Class 1',
      subject: '',
      videoUrl: ''
    };
    this.extractedVideoId = null;
    this.safePreviewUrl = null;
  }
}
