using System.ComponentModel.DataAnnotations;

namespace StudiousIndex.API.DTOs
{
    public class MarkAttendanceDto
    {
        [Required]
        public string ClassLevel { get; set; } = string.Empty;

        [Required]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public List<StudentAttendanceItemDto> Students { get; set; } = new();
    }

    public class StudentAttendanceItemDto
    {
        [Required]
        public string StudentId { get; set; } = string.Empty;

        public bool IsPresent { get; set; }
    }

    public class StudentAttendanceSummaryDto
    {
        public int TotalClasses { get; set; }
        public int PresentClasses { get; set; }
        public int AbsentClasses { get; set; }
        public double AttendancePercentage { get; set; }
        public string Status { get; set; } = string.Empty; // "Eligible" or "Shortage"
    }
}
