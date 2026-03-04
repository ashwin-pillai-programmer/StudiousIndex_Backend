using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace StudiousIndex.Domain.Entities
{
    public class AttendanceSession
    {
        public int Id { get; set; }
        
        [Required]
        public string ClassLevel { get; set; } = string.Empty;
        
        [Required]
        public string Subject { get; set; } = string.Empty;
        
        public DateTime Date { get; set; } = DateTime.UtcNow;
        
        [Required]
        public string CreatedByTeacherId { get; set; } = string.Empty;
        public ApplicationUser? CreatedByTeacher { get; set; }
        
        public ICollection<StudentAttendance> StudentAttendances { get; set; } = new List<StudentAttendance>();
    }
}
