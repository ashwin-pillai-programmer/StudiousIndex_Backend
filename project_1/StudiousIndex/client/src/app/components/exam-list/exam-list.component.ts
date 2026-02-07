import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ExamDto } from '../../models/exam.model';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.css'
})
export class ExamListComponent implements OnInit {
  exams: ExamDto[] = [];
  role = '';
  
  examService = inject(ExamService);
  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit() {
    this.role = this.authService.getUserRole();
    this.loadExams();
  }

  loadExams() {
    this.examService.getExams().subscribe(data => {
      this.exams = data;
    });
  }

  approveExam(id: number) {
    if (confirm('Are you sure you want to approve this exam?')) {
      this.examService.approveExam(id).subscribe(() => {
        this.loadExams();
      });
    }
  }
  
  logout() {
    this.authService.logout();
  }
}
