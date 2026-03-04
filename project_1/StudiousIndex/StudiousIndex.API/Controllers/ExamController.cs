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
        public async Task<IActionResult> GetExams()
        {
            var query = _context.Exams.Include(e => e.CreatedByUser).Include(e => e.Questions).AsQueryable();
            var now = DateTime.Now;

            // Only show active exams across all dashboards
            query = query.Where(e => e.IsActive);

            if (User.Identity?.IsAuthenticated == true && User.IsInRole("Student"))
            {
                // Students only see approved exams that haven't expired yet in the "Available" list.
                query = query.Where(e => e.IsApproved && e.ScheduledDate.AddMinutes(e.DurationMinutes) > now);
            }
            // Admins and Teachers see all active exams (pending or approved)

            var exams = await query.ToListAsync();
            var dtos = exams.Select(e => new ExamDto
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                DurationMinutes = e.DurationMinutes,
                Grade = e.Grade,
                Board = e.Board,
                ScheduledDate = e.ScheduledDate,
                CreatedBy = e.CreatedByUser?.FullName ?? "Teacher",
                QuestionCount = e.Questions.Count,
                IsApproved = e.IsApproved,
                IsPracticeEnabled = e.IsPracticeEnabled,
                IsExpired = e.ScheduledDate.AddMinutes(e.DurationMinutes) <= now
            });
            return Ok(dtos);
        }

        [HttpGet("practice")]
        public async Task<IActionResult> GetPracticeExams()
        {
            var now = DateTime.Now;
            var exams = await _context.Exams
                .Include(e => e.CreatedByUser)
                .Include(e => e.Questions)
                // Admins must approve exams for practice (IsPracticeEnabled)
                // Practice exams are only visible if IsPracticeEnabled is true
                // Note: We don't check IsActive here because we deactivate the exam 
                // when moving it to practice mode to hide it from regular dashboards
                .Where(e => e.IsPracticeEnabled && e.ScheduledDate.AddMinutes(e.DurationMinutes) <= now)
                .ToListAsync();

            var dtos = exams.Select(e => new ExamDto
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                DurationMinutes = e.DurationMinutes,
                Grade = e.Grade,
                Board = e.Board,
                ScheduledDate = e.ScheduledDate,
                CreatedBy = e.CreatedByUser?.FullName ?? "Teacher",
                QuestionCount = e.Questions.Count,
                IsApproved = e.IsApproved,
                IsPracticeEnabled = e.IsPracticeEnabled,
                IsExpired = true
            });

            return Ok(dtos);
        }

        [HttpPut("{id:int}/approve")]
        public async Task<IActionResult> ApproveExam(int id)
        {
            var exam = await _context.Exams.FindAsync(id);
            if (exam == null) return NotFound();

            exam.IsApproved = true;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Exam approved successfully" });
        }

        [HttpPut("{id:int}/practice/toggle")]
        public async Task<IActionResult> TogglePractice(int id)
        {
            var exam = await _context.Exams.FindAsync(id);
            if (exam == null) return NotFound();

            var now = DateTime.Now;
            if (exam.ScheduledDate.AddMinutes(exam.DurationMinutes) > now)
            {
                return BadRequest("Practice mode can only be enabled after the exam has finished.");
            }

            exam.IsPracticeEnabled = !exam.IsPracticeEnabled;
            
            // Automatically deactivate from regular dashboards when practice is enabled
            if (exam.IsPracticeEnabled)
            {
                exam.IsActive = false;
            }
            else
            {
                // If practice is disabled, we keep it inactive (effectively deleted)
                // as per the requirement to remove it from regular dashboards
                exam.IsActive = false;
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteExam(int id)
        {
            var exam = await _context.Exams
                .Include(e => e.Questions)
                .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (exam == null) return NotFound();

            // To avoid 500 Internal Server Error (Foreign Key constraints), 
            // we must remove all related data first.
            
            // 1. Remove all student attempts and their answers
            var attempts = await _context.StudentExams
                .Where(se => se.ExamId == id)
                .ToListAsync();
            
            foreach (var attempt in attempts)
            {
                var answers = await _context.StudentExamAnswers
                    .Where(sea => sea.StudentExamId == attempt.Id)
                    .ToListAsync();
                _context.StudentExamAnswers.RemoveRange(answers);
            }
            _context.StudentExams.RemoveRange(attempts);

            // 2. Questions and Options are usually handled by cascade delete 
            // if configured, but let's be explicit to be safe.
            _context.Exams.Remove(exam);

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("{id:int}")]
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
                CreatedBy = exam.CreatedByUser?.FullName ?? "Teacher",
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
        public async Task<IActionResult> CreateExam([FromBody] CreateExamDto model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            // Fallback for development if not logged in
            if (string.IsNullOrEmpty(userId))
            {
                var teacher = await _context.Users.FirstOrDefaultAsync(u => u.Email == "teacher@studiousindex.com");
                userId = teacher?.Id ?? _context.Users.First().Id;
            }

            var exam = new Exam
            {
                Title = model.Title,
                Description = model.Description,
                DurationMinutes = model.DurationMinutes,
                Grade = model.Grade,
                Board = model.Board,
                ScheduledDate = model.ScheduledDate,
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

        [HttpPost("{id:int}/start")]
        public async Task<IActionResult> StartExam(int id, [FromQuery] bool isPractice = false)
        {
            var exam = await _context.Exams.FindAsync(id);
            if (exam == null) return NotFound("Exam not found.");

            var now = DateTime.Now;
            var expirationTime = exam.ScheduledDate.AddMinutes(exam.DurationMinutes);

            // If not practice, check if exam is actually active and scheduled for now
            if (!isPractice)
            {
                if (!exam.IsActive)
                    return BadRequest("This exam is no longer active.");
                
                if (!exam.IsApproved)
                    return BadRequest("This exam has not been approved by admin yet.");

                if (exam.ScheduledDate > now)
                    return BadRequest($"This exam has not started yet. It starts at {exam.ScheduledDate}.");

                if (expirationTime < now)
                    return BadRequest("This exam has already finished.");
            }
            else 
            {
                // If it's practice, it must be enabled and expired
                if (!exam.IsPracticeEnabled)
                    return BadRequest("This exam is not enabled for practice sessions.");
                
                if (expirationTime > now)
                    return BadRequest("This exam can only be started for practice after the original time has expired.");
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            // Fallback for development if not logged in
            if (string.IsNullOrEmpty(userId))
            {
                var student = await _context.Users.FirstOrDefaultAsync(u => u.Email == "student@studiousindex.com");
                userId = student?.Id ?? _context.Users.First().Id;
            }

            // Check if already attempted (only for real exams)
            if (!isPractice)
            {
                var existingAttempt = await _context.StudentExams
                    .FirstOrDefaultAsync(se => se.ExamId == id && se.StudentId == userId && !se.IsPractice);
                if (existingAttempt != null) return BadRequest("You have already attempted this exam.");
            }

            var attempt = new StudentExam
            {
                ExamId = id,
                StudentId = userId,
                StartTime = now,
                IsPractice = isPractice
            };

            _context.StudentExams.Add(attempt);
            await _context.SaveChangesAsync();

            return Ok(new { AttemptId = attempt.Id });
        }

        [HttpPost("{id:int}/submit")]
        public async Task<ActionResult<ExamSubmissionResultDto>> SubmitExam(int id, [FromBody] SubmitExamDto submission)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            // Fallback for development if not logged in
            if (string.IsNullOrEmpty(userId))
            {
                var student = await _context.Users.FirstOrDefaultAsync(u => u.Email == "student@studiousindex.com");
                userId = student?.Id ?? _context.Users.First().Id;
            }
            
            var attempt = await _context.StudentExams
                .Include(se => se.Exam!)
                .ThenInclude(e => e.Questions)
                .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(se => se.Id == submission.AttemptId && se.StudentId == userId);

            if (attempt == null) return NotFound("Exam attempt not found.");
            if (attempt.IsCompleted) return BadRequest("Exam already submitted.");

            // Update IsPractice if it was started as a regular exam but submitted as practice
            // (though normally this should match the start state)
            attempt.IsPractice = submission.IsPractice;

            int score = 0;
            int totalMarks = 0;
            
            if (attempt.Exam == null) return StatusCode(500, "Exam data missing.");

            foreach(var question in attempt.Exam.Questions)
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

            // Automatically "delete" (deactivate) the exam from all dashboards if submitted as practice
            if (attempt.IsPractice && attempt.Exam != null)
            {
                attempt.Exam.IsActive = false;
            }

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


        [HttpGet("attempt/{attemptId:int}/detail")]
        public async Task<IActionResult> GetExamAttemptDetail(int attemptId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            // Fallback for development if not logged in
            if (string.IsNullOrEmpty(userId))
            {
                var student = await _context.Users.FirstOrDefaultAsync(u => u.Email == "student@studiousindex.com");
                userId = student?.Id ?? _context.Users.First().Id;
            }

            var attempt = await _context.StudentExams
                .Include(se => se.Exam)
                .ThenInclude(e => e!.Questions)
                .ThenInclude(q => q.Options)
                .Include(se => se.Answers)
                .Include(se => se.Student)
                .FirstOrDefaultAsync(se => se.Id == attemptId);

            if (attempt == null) return NotFound();

            // Check if user has permission to view this attempt
            // Admin/Teacher can view all, Student can only view their own
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            if (string.IsNullOrEmpty(userRole)) userRole = "Admin"; // Fallback for dev

            if (userRole == "Student" && attempt.StudentId != userId)
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
        public async Task<IActionResult> GetMyAttempts([FromQuery] bool includePractice = false)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            // Fallback for development if not logged in
            if (string.IsNullOrEmpty(userId))
            {
                var student = await _context.Users.FirstOrDefaultAsync(u => u.Email == "student@studiousindex.com");
                userId = student?.Id ?? _context.Users.First().Id;
            }

            var query = _context.StudentExams
                .Include(se => se.Exam)
                .ThenInclude(e => e!.Questions)
                .Where(se => se.StudentId == userId && se.IsCompleted);

            if (!includePractice)
            {
                query = query.Where(se => !se.IsPractice);
            }

            var attempts = await query
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

        [HttpGet("{id:int}/results")]
        public async Task<IActionResult> GetExamResults(int id)
        {
            var attempts = await _context.StudentExams
                .Include(se => se.Student)
                .Include(se => se.Exam)
                .ThenInclude(e => e!.Questions)
                .Where(se => se.ExamId == id && se.IsCompleted && se.Exam!.IsActive)
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
