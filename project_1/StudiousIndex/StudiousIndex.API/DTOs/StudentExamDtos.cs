using System.ComponentModel.DataAnnotations;

namespace StudiousIndex.API.DTOs
{
    public class StartExamResponseDto
    {
        public int AttemptId { get; set; }
        public int ExamId { get; set; }
        public DateTime StartTime { get; set; }
    }

    public class SubmitExamDto
    {
        public int AttemptId { get; set; }
        public List<SubmitAnswerDto> Answers { get; set; } = new();
    }

    public class SubmitAnswerDto
    {
        public int QuestionId { get; set; }
        public int SelectedOptionId { get; set; }
    }

    public class ExamSubmissionResultDto
    {
        public int AttemptId { get; set; }
        public int Score { get; set; }
        public int TotalMarks { get; set; }
        public bool IsPassed { get; set; }
        public DateTime SubmitTime { get; set; }
    }
}
