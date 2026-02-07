import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { ExamDto } from '../../models/exam.model';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent implements OnInit {
  exams: ExamDto[] = [];
  loading = true;
  
  examService = inject(ExamService);
  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit() {
    this.loadExams();
  }

  loadExams() {
    this.examService.getExams().subscribe({
      next: (data) => {
        this.exams = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading exams', err);
        this.loading = false;
      }
    });
  }
}
