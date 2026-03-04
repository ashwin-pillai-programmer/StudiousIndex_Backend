using System;
using System.ComponentModel.DataAnnotations;

namespace StudiousIndex.Domain.Entities
{
    public class Notification
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Message { get; set; } = string.Empty;
        
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser? User { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsRead { get; set; } = false;
        
        public string Type { get; set; } = "General"; // Exam, General, etc.
        
        public int? RelatedId { get; set; } // e.g. ExamId
    }
}
