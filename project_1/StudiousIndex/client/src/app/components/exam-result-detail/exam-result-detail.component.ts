import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { ExamResultDetailDto } from '../../models/exam.model';

@Component({
  selector: 'app-exam-result-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exam-result-detail.component.html',
  styleUrl: './exam-result-detail.component.css'
})
export class ExamResultDetailComponent implements OnInit {
  result: ExamResultDetailDto | undefined;
  loading = true;
  
  route = inject(ActivatedRoute);
  router = inject(Router);
  examService = inject(ExamService);
  authService = inject(AuthService);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.examService.getAttemptDetail(+id).subscribe({
        next: (data) => {
          this.result = data;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  getOptionClass(question: any, option: any): string {
    if (question.correctOptionId === option.id) {
      return 'list-group-item-success'; // Always highlight correct answer in green
    }
    if (question.selectedOptionId === option.id && !question.isCorrect) {
      return 'list-group-item-danger'; // Highlight wrong selection in red
    }
    if (question.selectedOptionId === option.id && question.isCorrect) {
      return 'list-group-item-success'; // Highlight correct selection in green
    }
    return '';
  }

  getIconClass(question: any, option: any): string {
    if (question.selectedOptionId === option.id) {
      return question.isCorrect ? 'bi bi-check-circle-fill text-success' : 'bi bi-x-circle-fill text-danger';
    }
    if (question.correctOptionId === option.id) {
      return 'bi bi-check-circle-fill text-success';
    }
    return 'bi bi-circle';
  }

  goBack() {
    if (this.authService.getUserRole() === 'Student') {
      this.router.navigate(['/student/dashboard']);
    } else {
      this.router.navigate(['/exams']);
    }
  }
}
