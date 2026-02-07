import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  changeRole(user: any, role: string) {
    if (confirm(`Are you sure you want to change ${user.fullName}'s role to ${role}?`)) {
      this.adminService.updateUserRole(user.id, role).subscribe({
        next: () => {
          user.role = role;
          alert('Role updated successfully');
        },
        error: (err) => alert('Failed to update role')
      });
    }
  }

  toggleStatus(user: any) {
    const newStatus = !user.isActive;
    const action = newStatus ? 'enable' : 'disable';
    if (confirm(`Are you sure you want to ${action} ${user.fullName}?`)) {
      this.adminService.updateUserStatus(user.id, newStatus).subscribe({
        next: () => {
          user.isActive = newStatus;
        },
        error: (err) => alert(`Failed to ${action} user`)
      });
    }
  }
}
