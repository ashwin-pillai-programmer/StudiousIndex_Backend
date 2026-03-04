using System.ComponentModel.DataAnnotations;

namespace StudiousIndex.Domain.Entities
{
    public class StudentResult
    {
        public int Id { get; set; }
        public string StudentId { get; set; } = string.Empty;
        public ApplicationUser? Student { get; set; }
        public int TotalMarks { get; set; }
        public int ObtainedMarks { get; set; }
        public double Percentage { get; set; }
        public string Grade { get; set; } = string.Empty;
        public int Rank { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        public ICollection<StudiousIndex.Domain.Entities.SubjectResult> SubjectResults { get; set; } =
            new List<StudiousIndex.Domain.Entities.SubjectResult>();
    }
}
