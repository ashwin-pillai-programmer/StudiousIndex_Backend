using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudiousIndex.API.DTOs;
using StudiousIndex.Data;
using StudiousIndex.Domain.Entities;
using System.Security.Claims;

namespace StudiousIndex.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExamController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ExamController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetExams()
        {
            var query = _context.Exams.Include(e => e.CreatedByUser).Include(e => e.Questions).AsQueryable();

            if (User.IsInRole("Student"))
            {
                query = query.Where(e => e.IsApproved && e.IsActive);
            }

            var exams = await query.ToListAsync();
            var dtos = exams.Select(e => new ExamDto
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                DurationMinutes = e.DurationMinutes,
                CreatedBy = e.CreatedByUser?.FullName ?? "Unknown",
                QuestionCount = e.Questions.Count,
                IsApproved = e.IsApproved
            });
            return Ok(dtos);
        }

        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveExam(int id)
        {
            var exam = await _context.Exams.FindAsync(id);
            if (exam == null) return NotFound();

            exam.IsApproved = true;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Exam approved successfully" });
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetExam(int id)
        {
            var exam = await _context.Exams
                .Include(e => e.CreatedByUser)
                .Include(e => e.Questions)
                .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (exam == null) return NotFound();

            var dto = new ExamDetailDto
            {
                Id = exam.Id,
                Title = exam.Title,
                Description = exam.Description,
                DurationMinutes = exam.DurationMinutes,
                CreatedBy = exam.CreatedByUser?.FullName ?? "Unknown",
                QuestionCount = exam.Questions.Count,
                Questions = exam.Questions.Select(q => new QuestionDetailDto
                {
                    Id = q.Id,
                    Text = q.Text,
                    Marks = q.Marks,
                    Options = q.Options.Select(o => new OptionDto
                    {
                        Id = o.Id,
                        Text = o.Text
                    }).ToList()
                }).ToList()
            };

            return Ok(dto);
        }

        [HttpPost]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> CreateExam([FromBody] CreateExamDto model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _context.Users.FindAsync(userId);

            var exam = new Exam
            {
                Title = model.Title,
                Description = model.Description,
                DurationMinutes = model.DurationMinutes,
                CreatedByUserId = userId!,
                IsApproved = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            foreach (var qDto in model.Questions)
            {
                var question = new Question
                {
                    Text = qDto.Text,
                    Marks = qDto.Marks
                };

                foreach (var oDto in qDto.Options)
                {
                    question.Options.Add(new Option
                    {
                        Text = oDto.Text,
                        IsCorrect = oDto.IsCorrect
                    });
                }
                exam.Questions.Add(question);
            }

            _context.Exams.Add(exam);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetExam), new { id = exam.Id }, new { id = exam.Id });
        }

        [HttpPost("{id}/start")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<StartExamResponseDto>> StartExam(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var exam = await _context.Exams.FindAsync(id);
            if (exam == null || !exam.IsApproved || !exam.IsActive) 
                return BadRequest("Exam is not available.");

            var existingAttempt = await _context.StudentExams
                .FirstOrDefaultAsync(se => se.ExamId == id && se.StudentId == userId && !se.IsCompleted);
                
            if (existingAttempt != null)
            {
                return Ok(new StartExamResponseDto 
                { 
                    AttemptId = existingAttempt.Id,
                    ExamId = id,
                    StartTime = existingAttempt.StartTime
                });
            }

            var attempt = new StudentExam
            {
                StudentId = userId!,
                ExamId = id,
                StartTime = DateTime.UtcNow,
                IsCompleted = false
            };

            _context.StudentExams.Add(attempt);
            await _context.SaveChangesAsync();

            return Ok(new StartExamResponseDto 
            { 
                AttemptId = attempt.Id,
                ExamId = id,
                StartTime = attempt.StartTime
            });
        }

        [HttpPost("{id}/submit")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<ExamSubmissionResultDto>> SubmitExam(int id, [FromBody] SubmitExamDto submission)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var attempt = await _context.StudentExams
                .Include(se => se.Exam)
                .ThenInclude(e => e.Questions)
                .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(se => se.Id == submission.AttemptId && se.StudentId == userId);

            if (attempt == null) return NotFound("Exam attempt not found.");
            if (attempt.IsCompleted) return BadRequest("Exam already submitted.");

            int score = 0;
            int totalMarks = 0;
            
            foreach(var question in attempt.Exam!.Questions)
            {
                totalMarks += question.Marks;
                var userAnswer = submission.Answers.FirstOrDefault(a => a.QuestionId == question.Id);
                
                if (userAnswer != null)
                {
                    var selectedOption = question.Options.FirstOrDefault(o => o.Id == userAnswer.SelectedOptionId);
                    bool isCorrect = selectedOption?.IsCorrect ?? false;
                    
                    if (isCorrect) score += question.Marks;
                    
                    _context.StudentExamAnswers.Add(new StudentExamAnswer
                    {
                        StudentExamId = attempt.Id,
                        QuestionId = question.Id,
                        SelectedOptionId = userAnswer.SelectedOptionId
                    });
                }
            }

            attempt.Score = score;
            attempt.SubmitTime = DateTime.UtcNow;
            attempt.IsCompleted = true;

            await _context.SaveChangesAsync();

            return Ok(new ExamSubmissionResultDto
            {
                AttemptId = attempt.Id,
                Score = score,
                TotalMarks = totalMarks,
                IsPassed = score >= (totalMarks * 0.4),
                SubmitTime = attempt.SubmitTime.Value
            });
        }


        [HttpGet("attempt/{attemptId}/detail")]
        [Authorize]
        public async Task<IActionResult> GetExamAttemptDetail(int attemptId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);

            var attempt = await _context.StudentExams
                .Include(se => se.Exam)
                .ThenInclude(e => e!.Questions)
                .ThenInclude(q => q.Options)
                .Include(se => se.Answers)
                .Include(se => se.Student)
                .FirstOrDefaultAsync(se => se.Id == attemptId);

            if (attempt == null) return NotFound();

            // Security check: Only the student who took the exam or Admin/Teacher can view details
            if (role == "Student" && attempt.StudentId != userId)
            {
                return Forbid();
            }

            var dto = new ExamResultDetailDto
            {
                Id = attempt.Id,
                ExamTitle = attempt.Exam?.Title ?? "Unknown",
                StudentName = attempt.Student?.FullName ?? "Unknown",
                Score = attempt.Score,
                TotalMarks = attempt.Exam?.Questions.Sum(q => q.Marks) ?? 0,
                SubmittedAt = attempt.SubmitTime ?? DateTime.UtcNow,
                Questions = attempt.Exam!.Questions.Select(q => 
                {
                    var userAnswer = attempt.Answers.FirstOrDefault(a => a.QuestionId == q.Id);
                    var correctOption = q.Options.FirstOrDefault(o => o.IsCorrect);
                    
                    return new QuestionResultDto
                    {
                        Id = q.Id,
                        Text = q.Text,
                        Marks = q.Marks,
                        SelectedOptionId = userAnswer?.SelectedOptionId ?? 0,
                        CorrectOptionId = correctOption?.Id ?? 0,
                        IsCorrect = userAnswer?.SelectedOptionId == correctOption?.Id,
                        Options = q.Options.Select(o => new OptionDto
                        {
                            Id = o.Id,
                            Text = o.Text
                        }).ToList()
                    };
                }).ToList()
            };

            return Ok(dto);
        }

        [HttpGet("history")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyAttempts()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var attempts = await _context.StudentExams
                .Include(se => se.Exam)
                .ThenInclude(e => e!.Questions)
                .Where(se => se.StudentId == userId && se.IsCompleted)
                .OrderByDescending(se => se.SubmitTime)
                .ToListAsync();

            var dtos = attempts.Select(se => new StudentExamResultDto
            {
                Id = se.Id,
                ExamTitle = se.Exam?.Title ?? "Unknown Exam",
                Score = se.Score,
                TotalMarks = se.Exam?.Questions.Sum(q => q.Marks) ?? 0,
                SubmittedAt = se.SubmitTime ?? DateTime.UtcNow
            });

            return Ok(dtos);
        }

        [HttpGet("{id}/results")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetExamResults(int id)
        {
            var attempts = await _context.StudentExams
                .Include(se => se.Student)
                .Include(se => se.Exam)
                .ThenInclude(e => e!.Questions)
                .Where(se => se.ExamId == id && se.IsCompleted)
                .OrderByDescending(se => se.Score)
                .ToListAsync();

            var dtos = attempts.Select(se => new StudentExamResultDto
            {
                Id = se.Id,
                ExamTitle = se.Exam?.Title ?? "Unknown Exam",
                StudentName = se.Student?.FullName ?? "Unknown Student",
                Score = se.Score,
                TotalMarks = se.Exam?.Questions.Sum(q => q.Marks) ?? 0,
                SubmittedAt = se.SubmitTime ?? DateTime.UtcNow
            });

            return Ok(dtos);
        }
    }
}
