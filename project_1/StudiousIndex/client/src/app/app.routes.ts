import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ExamListComponent } from './components/exam-list/exam-list.component';
import { ExamCreateComponent } from './components/exam-create/exam-create.component';
import { ExamDetailComponent } from './components/exam-detail/exam-detail.component';
import { ExamAttemptComponent } from './components/exam-attempt/exam-attempt.component';
import { ExamHistoryComponent } from './components/exam-history/exam-history.component';
import { ExamResultsComponent } from './components/exam-results/exam-results.component';
import { ExamResultDetailComponent } from './components/exam-result-detail/exam-result-detail.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './components/admin/admin-users/admin-users.component';
import { AdminExamsComponent } from './components/admin/admin-exams/admin-exams.component';
import { AdminMonitoringComponent } from './components/admin/admin-monitoring/admin-monitoring.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

import { TeacherDashboardComponent } from './components/teacher/teacher-dashboard/teacher-dashboard.component';
import { TeacherExamFormComponent } from './components/teacher/teacher-exam-form/teacher-exam-form.component';
import { TeacherMonitoringComponent } from './components/teacher/teacher-monitoring/teacher-monitoring.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';

export const routes: Routes = [
  { path: '', component: ExamListComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Student Routes
  { 
    path: 'student/dashboard', 
    component: StudentDashboardComponent, 
    canActivate: [roleGuard], 
    data: { role: 'Student' } 
  },
  
  // Teacher Routes (Dedicated Section)
  { 
    path: 'teacher/dashboard', 
    component: TeacherDashboardComponent, 
    canActivate: [roleGuard], 
    data: { role: 'Teacher' } 
  },
  { 
    path: 'teacher/exams/create', 
    component: TeacherExamFormComponent, 
    canActivate: [roleGuard], 
    data: { role: 'Teacher' } 
  },
  { 
    path: 'teacher/exams/edit/:id', 
    component: TeacherExamFormComponent, 
    canActivate: [roleGuard], 
    data: { role: 'Teacher' } 
  },
  { 
    path: 'teacher/monitoring', 
    component: TeacherMonitoringComponent, 
    canActivate: [roleGuard], 
    data: { role: 'Teacher' } 
  },
  
  // Legacy / Shared
  { path: 'exams/create', component: ExamCreateComponent, canActivate: [roleGuard], data: { role: 'Teacher' } }, // Keeping for backward compat or if needed
  { path: 'exams/:id/class-results', component: ExamResultsComponent, canActivate: [roleGuard], data: { role: 'Teacher' } }, 

  // Student Routes
  { path: 'exams/history', component: ExamHistoryComponent, canActivate: [authGuard] },
  { path: 'exams/attempts/:id/result', component: ExamResultDetailComponent, canActivate: [authGuard] },
  { path: 'exams/:id', component: ExamDetailComponent, canActivate: [authGuard] },
  { path: 'exams/:id/attempt', component: ExamAttemptComponent, canActivate: [authGuard] },

  // Admin Routes
  { 
    path: 'admin', 
    component: AdminDashboardComponent, 
    canActivate: [roleGuard], 
    data: { role: 'Admin' } 
  },
  { 
    path: 'admin/users', 
    component: AdminUsersComponent, 
    canActivate: [roleGuard], 
    data: { role: 'Admin' } 
  },
  { 
    path: 'admin/exams', 
    component: AdminExamsComponent, 
    canActivate: [roleGuard], 
    data: { role: 'Admin' } 
  },
  { 
    path: 'admin/monitoring', 
    component: AdminMonitoringComponent, 
    canActivate: [roleGuard], 
    data: { role: 'Admin' } 
  },

  { path: '**', redirectTo: '' }
];
