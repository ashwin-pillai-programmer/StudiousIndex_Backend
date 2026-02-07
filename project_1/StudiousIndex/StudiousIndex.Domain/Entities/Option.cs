using System.ComponentModel.DataAnnotations;

namespace StudiousIndex.Domain.Entities
{
    public class Option
    {
        public int Id { get; set; }
        
        public int QuestionId { get; set; }
        public Question? Question { get; set; }
        
        [Required]
        public string Text { get; set; } = string.Empty;
        
        public bool IsCorrect { get; set; }
    }
}
