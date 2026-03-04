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
        public required string Id { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Role { get; set; }
        public bool IsActive { get; set; }
        public string CollegeName { get; set; } = string.Empty;
    }

    public class UpdateUserRoleDto
    {
        public required string Role { get; set; } // "Admin", "Teacher", "Student"
    }

    public class UpdateUserStatusDto
    {
        public bool IsActive { get; set; }
    }
}
