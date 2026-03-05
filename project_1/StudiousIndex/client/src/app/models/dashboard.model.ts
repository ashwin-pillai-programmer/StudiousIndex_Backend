export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalExams: number;
  totalAttempts: number;
}

export interface StatCard {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  colorClass: string;
  link?: string;
  linkText?: string;
}

export interface QuickAction {
  label: string;
  icon: string;
  route: string;
  colorClass: string;
}
