using System.ComponentModel.DataAnnotations;

namespace StudiousIndex.Domain.Entities
{
    public class StudentAttendance
    {
        public int Id { get; set; }
        
        [Required]
        public string StudentId { get; set; } = string.Empty;
        public ApplicationUser? Student { get; set; }
        
        public int AttendanceSessionId { get; set; }
        public AttendanceSession? AttendanceSession { get; set; }
        
        public bool IsPresent { get; set; }
    }
}
