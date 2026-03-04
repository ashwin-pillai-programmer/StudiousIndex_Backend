using System.ComponentModel.DataAnnotations;

namespace StudiousIndex.Domain.Entities
{
    public class Exam
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        public int DurationMinutes { get; set; }

        public string Grade { get; set; } = string.Empty;
        public string Board { get; set; } = string.Empty;
        public DateTime ScheduledDate { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public string CreatedByUserId { get; set; } = string.Empty;
        public ApplicationUser? CreatedByUser { get; set; }
        
        public bool IsActive { get; set; } = true;

        public bool IsApproved { get; set; } = false;
        public bool IsPracticeEnabled { get; set; } = false;
        
        public ICollection<Question> Questions { get; set; } = new List<Question>();
    }
}
