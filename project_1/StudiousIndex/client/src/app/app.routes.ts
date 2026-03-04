import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) 
  },
  {
    path: 'login/:role',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) 
  },
  { 
    path: 'admin', 
    canActivate: [authGuard, roleGuard],
    data: { role: 'Admin' },
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent) 
  },
  {
    path: 'admin/users',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Admin' },
    loadComponent: () => import('./components/admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent)
  },
  { 
    path: 'teacher', 
    canActivate: [authGuard, roleGuard],
    data: { role: 'Teacher' },
    loadComponent: () => import('./pages/teacher/teacher.component').then(m => m.TeacherComponent) 
  },
  {
    path: 'teacher/reports',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Teacher' },
    loadComponent: () => import('./pages/teacher/teacher-reports/teacher-reports.component').then(m => m.TeacherReportsComponent)
  },
  {
    path: 'teacher/videos',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Teacher' },
    loadComponent: () => import('./pages/teacher/teacher-videos/teacher-videos.component').then(m => m.TeacherVideosComponent)
  },
  {
    path: 'teacher/exams',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Teacher' },
    loadComponent: () => import('./pages/teacher/teacher-exams/teacher-exams.component').then(m => m.TeacherExamsComponent)
  },
  {
    path: 'student/videos',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Student' },
    loadComponent: () => import('./pages/student/student.component').then(m => m.StudentComponent)
  },
  { 
    path: 'student',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Student' },
    loadComponent: () => import('./pages/student/student.component').then(m => m.StudentComponent) 
  },
  {
    path: 'student/take-exam/:id',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Student' },
    loadComponent: () => import('./pages/student/take-exam/take-exam.component').then(m => m.TakeExamComponent)
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];
