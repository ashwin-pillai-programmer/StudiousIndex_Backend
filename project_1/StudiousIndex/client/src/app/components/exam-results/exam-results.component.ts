import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ExamService } from '../../services/exam.service';

@Component({
  selector: 'app-exam-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-results.component.html',
  styleUrl: './exam-results.component.css'
})
export class ExamResultsComponent implements OnInit {
  results: any[] = [];
  examTitle: string = 'Loading...';
  examService = inject(ExamService);
  route = inject(ActivatedRoute);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.examService.getResults(+id).subscribe({
        next: (data) => {
          this.results = data;
          if (data.length > 0) {
            this.examTitle = data[0].examTitle;
          } else {
             // If no results, we might want to fetch exam details to get the title, but for now let's just leave it or fetch it separately if critical.
             this.examTitle = 'Exam Results';
          }
        },
        error: (err) => console.error(err)
      });
    }
  }
}
