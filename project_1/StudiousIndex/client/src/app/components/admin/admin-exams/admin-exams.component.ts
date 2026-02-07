import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-exams',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-exams.component.html',
  styleUrl: './admin-exams.component.css'
})
export class AdminExamsComponent implements OnInit {
  exams: any[] = [];
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadExams();
  }

  loadExams() {
    this.loading = true;
    this.adminService.getExams().subscribe({
      next: (data) => {
        this.exams = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  approveExam(exam: any) {
    if (confirm(`Approve exam "${exam.title}"?`)) {
      this.adminService.approveExam(exam.id).subscribe({
        next: () => {
          exam.isApproved = true;
          alert('Exam approved');
        },
        error: (err) => alert('Failed to approve exam')
      });
    }
  }

  rejectExam(exam: any) {
    if (confirm(`Reject (unapprove) exam "${exam.title}"?`)) {
      this.adminService.rejectExam(exam.id).subscribe({
        next: () => {
          exam.isApproved = false;
          alert('Exam rejected');
        },
        error: (err) => alert('Failed to reject exam')
      });
    }
  }

  deleteExam(exam: any) {
    if (confirm(`Are you sure you want to delete exam "${exam.title}"? This action cannot be undone.`)) {
      this.adminService.deleteExam(exam.id).subscribe({
        next: () => {
          this.exams = this.exams.filter(e => e.id !== exam.id);
          alert('Exam deleted');
        },
        error: (err) => alert('Failed to delete exam')
      });
    }
  }
}
