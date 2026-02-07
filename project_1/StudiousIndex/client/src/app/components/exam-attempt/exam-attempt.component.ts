import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { ExamDetailDto, SubmitExamDto } from '../../models/exam.model';

@Component({
  selector: 'app-exam-attempt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exam-attempt.component.html',
  styleUrl: './exam-attempt.component.css'
})
export class ExamAttemptComponent implements OnInit, OnDestroy {
  exam: ExamDetailDto | undefined;
  answers: { [key: number]: number } = {}; // questionId -> optionId
  score: number | null = null;
  totalMarks: number | null = null;
  attemptId: number = 0;
  
  // Timer related
  timeLeft: number = 0;
  interval: any;
  displayTime: string = '';
  
  route = inject(ActivatedRoute);
  examService = inject(ExamService);
  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.route.queryParams.subscribe(params => {
      this.attemptId = +params['attemptId'];
    });

    if (id) {
      this.examService.getExam(+id).subscribe(data => {
        this.exam = data;
        this.startTimer(this.exam.durationMinutes);
      });
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  startTimer(minutes: number) {
    this.timeLeft = minutes * 60;
    this.updateDisplayTime();
    
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateDisplayTime();
      } else {
        this.stopTimer();
        this.submit();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  updateDisplayTime() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    this.displayTime = `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  pad(val: number): string {
    return val < 10 ? '0' + val : val.toString();
  }

  submit() {
    this.stopTimer();
    if (this.exam && this.attemptId) {
      const submission: SubmitExamDto = {
        attemptId: this.attemptId,
        answers: Object.keys(this.answers).map(key => ({
          questionId: +key,
          selectedOptionId: this.answers[+key]
        }))
      };

      this.examService.submitExam(this.exam.id, submission).subscribe({
        next: (result) => {
          this.score = result.score;
          this.totalMarks = result.totalMarks;
          // Navigate to results page directly to show detailed feedback
          this.router.navigate(['exams', 'attempts', result.attemptId, 'result']);
        },
        error: (err) => console.error(err)
      });
    } else {
      console.error('Missing exam or attemptId');
    }
  }

  goBack() {
    if (this.authService.getUserRole() === 'Student') {
      this.router.navigate(['/student/dashboard']);
    } else {
      this.router.navigate(['/exams']);
    }
  }
}
