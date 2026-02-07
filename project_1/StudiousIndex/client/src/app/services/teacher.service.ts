import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TeacherDashboardStats {
  totalExams: number;
  approvedExams: number;
  pendingExams: number;
  totalStudentsAttempted: number;
}

export interface TeacherExamList {
  id: number;
  title: string;
  grade: string;
  board: string;
  durationMinutes: number;
  scheduledDate: string;
  status: string;
  questionCount: number;
}

export interface TeacherCreateExam {
  title: string;
  description: string;
  grade: string;
  board: string;
  durationMinutes: number;
  scheduledDate: string;
  questions: CreateQuestion[];
}

export interface CreateQuestion {
  text: string;
  marks: number;
  options: CreateOption[];
}

export interface CreateOption {
  text: string;
  isCorrect: boolean;
}

export interface TeacherStudentAttempt {
  attemptId: number;
  studentName: string;
  examTitle: string;
  attemptDate: string;
  totalMarks: number;
  maxMarks: number;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5131/api/teacher';

  getDashboardStats(): Observable<TeacherDashboardStats> {
    return this.http.get<TeacherDashboardStats>(`${this.apiUrl}/dashboard`);
  }

  getExams(): Observable<TeacherExamList[]> {
    return this.http.get<TeacherExamList[]>(`${this.apiUrl}/exams`);
  }

  getExam(id: number): Observable<TeacherCreateExam> {
    return this.http.get<TeacherCreateExam>(`${this.apiUrl}/exams/${id}`);
  }

  createExam(exam: TeacherCreateExam): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/exams`, exam);
  }

  updateExam(id: number, exam: TeacherCreateExam): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/exams/${id}`, exam);
  }

  deleteExam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/exams/${id}`);
  }

  getMonitoringData(): Observable<TeacherStudentAttempt[]> {
    return this.http.get<TeacherStudentAttempt[]>(`${this.apiUrl}/monitoring`);
  }
}
