import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { CreateExamDto, ExamDetailDto, ExamDto, ExamSubmissionResult, StudentExamResultDto, ExamResultDetailDto, StartExamResponse, SubmitExamDto } from '../models/exam.model';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private apiUrl = `${environment.apiUrl}/Exam`;
  private http = inject(HttpClient);

  constructor() { }

  getExams(): Observable<ExamDto[]> {
    return this.http.get<ExamDto[]>(this.apiUrl);
  }

  getExam(id: number): Observable<ExamDetailDto> {
    return this.http.get<ExamDetailDto>(`${this.apiUrl}/${id}`);
  }

  createExam(data: CreateExamDto): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  approveExam(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/approve`, {});
  }

  startExam(id: number): Observable<StartExamResponse> {
    return this.http.post<StartExamResponse>(`${this.apiUrl}/${id}/start`, {});
  }

  submitExam(id: number, submission: SubmitExamDto): Observable<ExamSubmissionResult> {
    return this.http.post<ExamSubmissionResult>(`${this.apiUrl}/${id}/submit`, submission);
  }

  getHistory(): Observable<StudentExamResultDto[]> {
    return this.http.get<StudentExamResultDto[]>(`${this.apiUrl}/history`);
  }

  getResults(examId: number): Observable<StudentExamResultDto[]> {
    return this.http.get<StudentExamResultDto[]>(`${this.apiUrl}/${examId}/results`);
  }

  getAttemptDetail(attemptId: number): Observable<ExamResultDetailDto> {
    return this.http.get<ExamResultDetailDto>(`${this.apiUrl}/attempt/${attemptId}/detail`);
  }
}
