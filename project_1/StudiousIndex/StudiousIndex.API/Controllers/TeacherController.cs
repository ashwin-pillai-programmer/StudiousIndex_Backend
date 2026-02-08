using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
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
    [Authorize(Roles = "Teacher")]
    public class TeacherController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public TeacherController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        private string GetCurrentUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet("dashboard")]
        public async Task<ActionResult<TeacherDashboardStatsDto>> GetDashboardStats()
        {
            var userId = GetCurrentUserId();
            var exams = await _context.Exams
                .Where(e => e.CreatedByUserId == userId && e.IsActive)
                .ToListAsync();

            var examIds = exams.Select(e => e.Id).ToList();
            var attempts = await _context.StudentExams
                .Where(r => examIds.Contains(r.ExamId) && r.IsCompleted)
                .CountAsync();

            return new TeacherDashboardStatsDto
            {
                TotalExams = exams.Count,
                ApprovedExams = exams.Count(e => e.IsApproved),
                PendingExams = exams.Count(e => !e.IsApproved),
                TotalStudentsAttempted = attempts
            };
        }

        [HttpGet("exams")]
        public async Task<ActionResult<IEnumerable<TeacherExamListDto>>> GetExams()
        {
            var userId = GetCurrentUserId();
            var exams = await _context.Exams
                .Include(e => e.Questions)
                .Where(e => e.CreatedByUserId == userId && e.IsActive)
                .OrderByDescending(e => e.CreatedAt)
                .Select(e => new TeacherExamListDto
                {
                    Id = e.Id,
                    Title = e.Title,
                    Grade = e.Grade,
                    Board = e.Board,
                    DurationMinutes = e.DurationMinutes,
                    ScheduledDate = e.ScheduledDate,
                    Status = e.IsApproved ? "Approved" : "Pending",
                    QuestionCount = e.Questions.Count
                })
                .ToListAsync();

            return Ok(exams);
        }

        [HttpGet("exams/{id}")]
        public async Task<ActionResult<TeacherCreateExamDto>> GetExam(int id)
        {
            var userId = GetCurrentUserId();
            var exam = await _context.Exams
                .Include(e => e.Questions)
                .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(e => e.Id == id && e.CreatedByUserId == userId && e.IsActive);

            if (exam == null) return NotFound();

            var dto = new TeacherCreateExamDto
            {
                Title = exam.Title,
                Description = exam.Description,
                Grade = exam.Grade,
                Board = exam.Board,
                DurationMinutes = exam.DurationMinutes,
                ScheduledDate = exam.ScheduledDate,
                Questions = exam.Questions.Select(q => new CreateQuestionDto
                {
                    Text = q.Text,
                    Marks = q.Marks,
                    Options = q.Options.Select(o => new CreateOptionDto
                    {
                        Text = o.Text,
                        IsCorrect = o.IsCorrect
                    }).ToList()
                }).ToList()
            };

            return Ok(dto);
        }

        [HttpPost("exams")]
        public async Task<ActionResult<int>> CreateExam(TeacherCreateExamDto dto)
        {
            var userId = GetCurrentUserId();
            
            var exam = new Exam
            {
                Title = dto.Title,
                Description = dto.Description,
                Grade = dto.Grade,
                Board = dto.Board,
                DurationMinutes = dto.DurationMinutes,
                ScheduledDate = dto.ScheduledDate,
                CreatedByUserId = userId,
                IsApproved = false, // Always pending initially
                IsActive = true
            };

            foreach (var qDto in dto.Questions)
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

            return CreatedAtAction(nameof(GetExam), new { id = exam.Id }, exam.Id);
        }

        [HttpPut("exams/{id}")]
        public async Task<IActionResult> UpdateExam(int id, TeacherCreateExamDto dto)
        {
            var userId = GetCurrentUserId();
            var exam = await _context.Exams
                .Include(e => e.Questions)
                .ThenInclude(q => q.Options)
                .FirstOrDefaultAsync(e => e.Id == id && e.CreatedByUserId == userId && e.IsActive);

            if (exam == null) return NotFound();
            if (exam.IsApproved) return BadRequest("Cannot edit approved exams.");

            // Update fields
            exam.Title = dto.Title;
            exam.Description = dto.Description;
            exam.Grade = dto.Grade;
            exam.Board = dto.Board;
            exam.DurationMinutes = dto.DurationMinutes;
            exam.ScheduledDate = dto.ScheduledDate;

            // Simple update: Clear questions and re-add (easier than diffing for now)
            _context.Questions.RemoveRange(exam.Questions);
            exam.Questions.Clear();

            foreach (var qDto in dto.Questions)
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

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("exams/{id}")]
        public async Task<IActionResult> DeleteExam(int id)
        {
            var userId = GetCurrentUserId();
            var exam = await _context.Exams
                .FirstOrDefaultAsync(e => e.Id == id && e.CreatedByUserId == userId && e.IsActive);

            if (exam == null) return NotFound();
            if (exam.IsApproved) return BadRequest("Cannot delete approved exams.");

            exam.IsActive = false; // Soft delete
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("monitoring")]
        public async Task<ActionResult<IEnumerable<TeacherStudentAttemptDto>>> GetMonitoringData()
        {
            var userId = GetCurrentUserId();
            var attempts = await _context.StudentExams
                .Include(r => r.Exam!)
                .ThenInclude(e => e.Questions)
                .Include(r => r.Student)
                .Where(r => r.Exam!.CreatedByUserId == userId && r.IsCompleted)
                .OrderByDescending(r => r.SubmitTime)
                .ToListAsync();

            var dtos = attempts.Select(r => new TeacherStudentAttemptDto
            {
                AttemptId = r.Id,
                StudentName = r.Student?.FullName ?? "Unknown",
                ExamTitle = r.Exam?.Title ?? "Unknown",
                AttemptDate = r.SubmitTime ?? r.StartTime,
                TotalMarks = r.Score,
                MaxMarks = r.Exam?.Questions.Sum(q => q.Marks) ?? 0
            }).ToList();

            return Ok(dtos);
        }
    }
}
