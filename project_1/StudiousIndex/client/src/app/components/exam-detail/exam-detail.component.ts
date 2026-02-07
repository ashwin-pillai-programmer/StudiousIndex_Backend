import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { ExamDetailDto } from '../../models/exam.model';

@Component({
  selector: 'app-exam-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exam-detail.component.html',
  styleUrl: './exam-detail.component.css'
})
export class ExamDetailComponent implements OnInit {
  exam: ExamDetailDto | undefined;
  role: string = '';
  
  route = inject(ActivatedRoute);
  router = inject(Router);
  examService = inject(ExamService);
  authService = inject(AuthService);

  ngOnInit() {
    this.role = this.authService.getUserRole();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.examService.getExam(+id).subscribe({
        next: (data) => this.exam = data,
        error: (err) => console.error(err)
      });
    }
  }

  startExam() {
    if (this.exam) {
      this.examService.startExam(this.exam.id).subscribe({
        next: (response) => {
          this.router.navigate(['attempt'], { 
            relativeTo: this.route,
            queryParams: { attemptId: response.attemptId }
          });
        },
        error: (err) => {
          console.error(err);
          alert('Failed to start exam. Please try again.');
        }
      });
    }
  }
}
