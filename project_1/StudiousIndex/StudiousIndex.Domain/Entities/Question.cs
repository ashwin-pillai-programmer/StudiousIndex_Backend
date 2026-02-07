using System.ComponentModel.DataAnnotations;

namespace StudiousIndex.Domain.Entities
{
    public class Question
    {
        public int Id { get; set; }
        
        public int ExamId { get; set; }
        public Exam? Exam { get; set; }
        
        [Required]
        public string Text { get; set; } = string.Empty;
        
        public int Marks { get; set; }
        
        public ICollection<Option> Options { get; set; } = new List<Option>();
    }
}
