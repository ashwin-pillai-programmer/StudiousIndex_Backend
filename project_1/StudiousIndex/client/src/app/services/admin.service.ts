import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:5131/api/admin';

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/role`, { role });
  }

  updateUserStatus(userId: string, isActive: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/status`, { isActive });
  }

  getExams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/exams`);
  }

  approveExam(examId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/exams/${examId}/approve`, {});
  }

  rejectExam(examId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/exams/${examId}/reject`, {});
  }

  deleteExam(examId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/exams/${examId}`);
  }

  getAttempts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/attempts`);
  }
}
