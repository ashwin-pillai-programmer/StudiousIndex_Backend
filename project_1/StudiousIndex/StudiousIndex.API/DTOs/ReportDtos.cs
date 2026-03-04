namespace StudiousIndex.API.DTOs
{
    public class SubjectResultDto
    {
        public string Subject { get; set; } = string.Empty;
        public int TotalMarks { get; set; }
        public int ObtainedMarks { get; set; }
        public double Percentage { get; set; }
        public string Grade { get; set; } = string.Empty;
    }

    public class StudentReportDto
    {
        public string StudentId { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public int TotalMarks { get; set; }
        public int ObtainedMarks { get; set; }
        public double Percentage { get; set; }
        public string Grade { get; set; } = string.Empty;
        public int Rank { get; set; }
        public List<SubjectResultDto> Subjects { get; set; } = new();
    }
}

