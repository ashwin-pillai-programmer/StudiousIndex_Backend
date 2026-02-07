namespace StudiousIndex.API.DTOs
{
    public class TeacherDashboardStatsDto
    {
        public int TotalExams { get; set; }
        public int ApprovedExams { get; set; }
        public int PendingExams { get; set; }
        public int TotalStudentsAttempted { get; set; }
    }

    public class TeacherExamListDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Grade { get; set; } = string.Empty;
        public string Board { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public DateTime ScheduledDate { get; set; }
        public string Status { get; set; } = string.Empty; // Pending, Approved, Rejected
        public int QuestionCount { get; set; }
    }

    public class TeacherStudentAttemptDto
    {
        public int AttemptId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string ExamTitle { get; set; } = string.Empty;
        public DateTime AttemptDate { get; set; }
        public int TotalMarks { get; set; }
        public int MaxMarks { get; set; }
    }

    public class TeacherCreateExamDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Grade { get; set; } = string.Empty;
        public string Board { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public DateTime ScheduledDate { get; set; }
        public List<CreateQuestionDto> Questions { get; set; } = new();
    }
}
