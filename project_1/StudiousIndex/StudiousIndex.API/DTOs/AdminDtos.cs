namespace StudiousIndex.API.DTOs
{
    public class AdminDashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalStudents { get; set; }
        public int TotalTeachers { get; set; }
        public int TotalExams { get; set; }
        public int TotalAttempts { get; set; }
    }

    public class UserListDto
    {
        public string Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public bool IsActive { get; set; }
    }

    public class UpdateUserRoleDto
    {
        public string Role { get; set; } // "Admin", "Teacher", "Student"
    }

    public class UpdateUserStatusDto
    {
        public bool IsActive { get; set; }
    }
}
