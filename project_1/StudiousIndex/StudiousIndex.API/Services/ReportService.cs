using Microsoft.EntityFrameworkCore;
using StudiousIndex.API.DTOs;
using StudiousIndex.Data;
using StudiousIndex.Domain.Entities;

namespace StudiousIndex.API.Services
{
    public interface IReportService
    {
        Task<StudentReportDto> GenerateReportAsync(string studentId);
        Task<StudentReportDto?> GetReportAsync(string studentId);
    }

    public class ReportService : IReportService
    {
        private readonly ApplicationDbContext _context;

        public ReportService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<StudentReportDto> GenerateReportAsync(string studentId)
        {
            var student = await _context.Users.FirstOrDefaultAsync(u => u.Id == studentId);
            if (student == null) throw new InvalidOperationException("Student not found.");

            var attempts = await _context.StudentExams
                .Include(se => se.Exam!)
                .ThenInclude(e => e.Questions)
                .Where(se => se.StudentId == studentId && se.IsCompleted && !se.IsPractice)
                .ToListAsync();

            if (attempts.Count == 0) throw new InvalidOperationException("No completed exams for this student.");

            var subjectGroups = attempts
                .Where(a => a.Exam != null)
                .GroupBy(a => a.Exam!.Grade);

            var subjectResults = new List<SubjectResult>();

            foreach (var group in subjectGroups)
            {
                var subject = group.Key;
                var totalMarks = group.Sum(a => a.Exam!.Questions.Sum(q => q.Marks));
                var obtainedMarks = group.Sum(a => a.Score);
                var percentage = totalMarks > 0 ? (double)obtainedMarks * 100.0 / totalMarks : 0.0;
                var grade = CalculateGrade(percentage);

                subjectResults.Add(new SubjectResult
                {
                    Subject = subject,
                    TotalMarks = totalMarks,
                    ObtainedMarks = obtainedMarks,
                    Percentage = percentage,
                    Grade = grade
                });
            }

            var overallTotal = subjectResults.Sum(s => s.TotalMarks);
            var overallObtained = subjectResults.Sum(s => s.ObtainedMarks);
            var overallPercentage = overallTotal > 0 ? (double)overallObtained * 100.0 / overallTotal : 0.0;
            var overallGrade = CalculateGrade(overallPercentage);

            var studentResult = await _context.StudentResults
                .Include(sr => sr.SubjectResults)
                .FirstOrDefaultAsync(sr => sr.StudentId == studentId);

            if (studentResult == null)
            {
                studentResult = new StudentResult
                {
                    StudentId = studentId,
                    TotalMarks = overallTotal,
                    ObtainedMarks = overallObtained,
                    Percentage = overallPercentage,
                    Grade = overallGrade,
                    GeneratedAt = DateTime.UtcNow
                };

                _context.StudentResults.Add(studentResult);
            }
            else
            {
                studentResult.TotalMarks = overallTotal;
                studentResult.ObtainedMarks = overallObtained;
                studentResult.Percentage = overallPercentage;
                studentResult.Grade = overallGrade;
                studentResult.GeneratedAt = DateTime.UtcNow;

                _context.SubjectResults.RemoveRange(studentResult.SubjectResults);
            }

            foreach (var sr in subjectResults)
            {
                sr.StudentResult = studentResult;
            }

            await _context.SubjectResults.AddRangeAsync(subjectResults);

            var allResults = await _context.StudentResults
                .Where(r => r.TotalMarks > 0)
                .OrderByDescending(r => r.Percentage)
                .ToListAsync();

            var rank = 0;
            for (var i = 0; i < allResults.Count; i++)
            {
                var r = allResults[i];
                r.Rank = i + 1;
                if (r.StudentId == studentId)
                {
                    rank = r.Rank;
                }
            }

            await _context.SaveChangesAsync();

            return new StudentReportDto
            {
                StudentId = studentId,
                StudentName = student.FullName ?? string.Empty,
                TotalMarks = studentResult.TotalMarks,
                ObtainedMarks = studentResult.ObtainedMarks,
                Percentage = studentResult.Percentage,
                Grade = studentResult.Grade,
                Rank = rank,
                Subjects = subjectResults.Select(s => new SubjectResultDto
                {
                    Subject = s.Subject,
                    TotalMarks = s.TotalMarks,
                    ObtainedMarks = s.ObtainedMarks,
                    Percentage = s.Percentage,
                    Grade = s.Grade
                }).ToList()
            };
        }

        public async Task<StudentReportDto?> GetReportAsync(string studentId)
        {
            var result = await _context.StudentResults
                .Include(sr => sr.Student)
                .Include(sr => sr.SubjectResults)
                .FirstOrDefaultAsync(sr => sr.StudentId == studentId);

            if (result == null) return null;

            return new StudentReportDto
            {
                StudentId = studentId,
                StudentName = result.Student?.FullName ?? string.Empty,
                TotalMarks = result.TotalMarks,
                ObtainedMarks = result.ObtainedMarks,
                Percentage = result.Percentage,
                Grade = result.Grade,
                Rank = result.Rank,
                Subjects = result.SubjectResults
                    .OrderBy(s => s.Subject)
                    .Select(s => new SubjectResultDto
                    {
                        Subject = s.Subject,
                        TotalMarks = s.TotalMarks,
                        ObtainedMarks = s.ObtainedMarks,
                        Percentage = s.Percentage,
                        Grade = s.Grade
                    }).ToList()
            };
        }

        private static string CalculateGrade(double percentage)
        {
            if (percentage >= 90) return "A+";
            if (percentage >= 80) return "A";
            if (percentage >= 70) return "B+";
            if (percentage >= 60) return "B";
            if (percentage >= 50) return "C";
            return "Fail";
        }
    }
}

