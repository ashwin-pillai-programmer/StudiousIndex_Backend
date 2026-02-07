import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExamService } from '../../services/exam.service';

@Component({
  selector: 'app-exam-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exam-history.component.html',
  styleUrl: './exam-history.component.css'
})
export class ExamHistoryComponent implements OnInit {
  history: any[] = [];
  examService = inject(ExamService);

  ngOnInit() {
    this.examService.getHistory().subscribe({
      next: (data) => this.history = data,
      error: (err) => console.error(err)
    });
  }
}
