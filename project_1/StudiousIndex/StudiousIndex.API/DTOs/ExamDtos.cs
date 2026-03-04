using System.ComponentModel.DataAnnotations;

namespace StudiousIndex.API.DTOs
{
    public class CreateExamDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        
        [Range(1, 180, ErrorMessage = "Duration must be between 1 and 180 minutes")]
        public int DurationMinutes { get; set; }

        public string Grade { get; set; } = string.Empty;
        public string Board { get; set; } = string.Empty;
        public DateTime ScheduledDate { get; set; }
        
        [MinLength(1, ErrorMessage = "At least one question is required")]
        public List<CreateQuestionDto> Questions { get; set; } = new();
    }

    public class CreateQuestionDto
    {
        [Required]
        public string Text { get; set; } = string.Empty;
        
        [Range(1, 100, ErrorMessage = "Marks must be at least 1")]
        public int Marks { get; set; }
        
        [MinLength(2, ErrorMessage = "At least two options are required")]
        public List<CreateOptionDto> Options { get; set; } = new();
    }

    public class CreateOptionDto
    {
        [Required]
        public string Text { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }

    public class ExamDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public string Grade { get; set; } = string.Empty;
        public string Board { get; set; } = string.Empty;
        public DateTime ScheduledDate { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public int QuestionCount { get; set; }
        public bool IsApproved { get; set; }
        public bool IsPracticeEnabled { get; set; }
        public bool IsExpired { get; set; }
    }

    public class ExamDetailDto : ExamDto
    {
        public List<QuestionDetailDto> Questions { get; set; } = new();
    }

    public class QuestionDetailDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public int Marks { get; set; }
        public List<OptionDto> Options { get; set; } = new();
    }

    public class OptionDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
    }

    public class StudentExamResultDto
    {
        public int Id { get; set; }
        public string ExamTitle { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public int Score { get; set; }
        public int TotalMarks { get; set; }
        public DateTime SubmittedAt { get; set; }
    }

    public class ExamResultDetailDto : StudentExamResultDto
    {
        public List<QuestionResultDto> Questions { get; set; } = new();
    }

    public class QuestionResultDto
    {
        public int Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public int Marks { get; set; }
        public int SelectedOptionId { get; set; }
        public int CorrectOptionId { get; set; }
        public bool IsCorrect { get; set; }
        public List<OptionDto> Options { get; set; } = new();
    }
}
