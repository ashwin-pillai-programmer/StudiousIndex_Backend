using System;

namespace StudiousIndex.Domain.Entities
{
    public class VideoLecture
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string ClassLevel { get; set; } // Changed to string to support "Class 1", "BSc CS", etc.
        public string Subject { get; set; }
        public string VideoUrl { get; set; }
        public bool IsApproved { get; set; }
        public string CreatedByTeacherId { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation property if needed (optional based on requirements)
        public virtual ApplicationUser CreatedByTeacher { get; set; }
    }
}
