using System.ComponentModel.DataAnnotations;

namespace StudiousIndex.Domain.Entities
{
    public class SubjectResult
    {
        public int Id { get; set; }
        public int StudentResultId { get; set; }
        public StudentResult? StudentResult { get; set; }
        public string Subject { get; set; } = string.Empty;
        public int TotalMarks { get; set; }
        public int ObtainedMarks { get; set; }
        public double Percentage { get; set; }
        public string Grade { get; set; } = string.Empty;
    }
}

