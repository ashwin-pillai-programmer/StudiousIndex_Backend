using System.ComponentModel.DataAnnotations;

namespace StudiousIndex.Domain.Entities
{
    public class StudentExamAnswer
    {
        public int Id { get; set; }

        public int StudentExamId { get; set; }
        public StudentExam? StudentExam { get; set; }

        public int QuestionId { get; set; }
        public Question? Question { get; set; }

        public int SelectedOptionId { get; set; }
        public Option? SelectedOption { get; set; }
    }
}
