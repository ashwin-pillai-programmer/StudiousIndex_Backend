using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudiousIndex.API.DTOs;
using StudiousIndex.Data;
using StudiousIndex.Domain.Entities;

namespace StudiousIndex.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AdminController(ApplicationDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        // 1. Dashboard Stats
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalUsers = await _userManager.Users.CountAsync();
            var totalExams = await _context.Exams.CountAsync();
            var totalAttempts = await _context.StudentExams.CountAsync();
            
            // Note: Counting by role is heavier as it involves joins, doing simplified version or separate queries
            var students = await _userManager.GetUsersInRoleAsync("Student");
            var teachers = await _userManager.GetUsersInRoleAsync("Teacher");

            return Ok(new AdminDashboardStatsDto
            {
                TotalUsers = totalUsers,
                TotalStudents = students.Count,
                TotalTeachers = teachers.Count,
                TotalExams = totalExams,
                TotalAttempts = totalAttempts
            });
        }

        // 2. User Management
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var userDtos = new List<UserListDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userDtos.Add(new UserListDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = roles.FirstOrDefault() ?? "None",
                    IsActive = user.IsActive
                });
            }

            return Ok(userDtos);
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(string id, [FromBody] UpdateUserRoleDto model)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound("User not found");

            if (!await _roleManager.RoleExistsAsync(model.Role))
                return BadRequest("Invalid role");

            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            await _userManager.AddToRoleAsync(user, model.Role);

            return Ok(new { Message = "User role updated successfully" });
        }

        [HttpPut("users/{id}/status")]
        public async Task<IActionResult> UpdateUserStatus(string id, [FromBody] UpdateUserStatusDto model)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound("User not found");

            user.IsActive = model.IsActive;
            await _userManager.UpdateAsync(user);

            // If disabling, we might want to update SecurityStamp to invalidate tokens, 
            // but keeping it simple for now.
            if (!model.IsActive)
            {
                await _userManager.UpdateSecurityStampAsync(user);
            }

            return Ok(new { Message = $"User status updated to {(model.IsActive ? "Active" : "Inactive")}" });
        }

        // 3. Exam Management
        [HttpGet("exams")]
        public async Task<IActionResult> GetAllExams()
        {
            var exams = await _context.Exams
                .Include(e => e.CreatedByUser)
                .Include(e => e.Questions)
                .OrderByDescending(e => e.Id)
                .ToListAsync();

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

        [HttpDelete("exams/{id}")]
        public async Task<IActionResult> DeleteExam(int id)
        {
            var exam = await _context.Exams.FindAsync(id);
            if (exam == null) return NotFound("Exam not found");

            _context.Exams.Remove(exam);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Exam deleted successfully" });
        }
        
        // Re-implementing Approve here for Admin convenience, or they can use ExamController
        [HttpPut("exams/{id}/approve")]
        public async Task<IActionResult> ApproveExam(int id)
        {
            var exam = await _context.Exams.FindAsync(id);
            if (exam == null) return NotFound("Exam not found");

            exam.IsApproved = true;
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Exam approved" });
        }

        [HttpPut("exams/{id}/reject")]
        public async Task<IActionResult> RejectExam(int id)
        {
            var exam = await _context.Exams.FindAsync(id);
            if (exam == null) return NotFound("Exam not found");

            exam.IsApproved = false;
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Exam rejected (unapproved)" });
        }

        // 4. Monitoring (Attempts)
        [HttpGet("attempts")]
        public async Task<IActionResult> GetAllAttempts()
        {
            var attempts = await _context.StudentExams
                .Include(a => a.Student)
                .Include(a => a.Exam)
                .OrderByDescending(a => a.StartTime)
                .ToListAsync();
            
            // Create a DTO for this if needed, or return anonymous object
            var result = attempts.Select(a => new 
            {
                a.Id,
                StudentName = a.Student?.FullName ?? "Unknown",
                ExamTitle = a.Exam?.Title ?? "Unknown",
                a.Score,
                AttemptDate = a.StartTime
            });

            return Ok(result);
        }
    }
}
