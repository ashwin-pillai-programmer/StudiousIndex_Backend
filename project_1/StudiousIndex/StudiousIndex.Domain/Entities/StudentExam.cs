using System.ComponentModel.DataAnnotations;

namespace StudiousIndex.Domain.Entities
{
    public class StudentExam
    {
        public int Id { get; set; }
        
        public string StudentId { get; set; } = string.Empty;
        public ApplicationUser? Student { get; set; }
        
        public int ExamId { get; set; }
        public Exam? Exam { get; set; }
        
        public DateTime StartTime { get; set; }
        public DateTime? SubmitTime { get; set; }
        
        public int Score { get; set; }
        
        public bool IsCompleted { get; set; }

        public ICollection<StudentExamAnswer> Answers { get; set; } = new List<StudentExamAnswer>();
    }
}
