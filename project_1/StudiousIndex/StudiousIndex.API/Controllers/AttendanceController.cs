using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudiousIndex.API.DTOs;
using StudiousIndex.API.Services;
using System.Security.Claims;

namespace StudiousIndex.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;

        public AttendanceController(IAttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }

        [HttpPost("mark")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> MarkAttendance([FromBody] MarkAttendanceDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

            var success = await _attendanceService.MarkAttendanceAsync(model, teacherId);
            if (!success) return StatusCode(500, "An error occurred while marking attendance.");

            return Ok(new { Message = "Attendance marked successfully." });
        }

        [HttpGet("student/{studentId}")]
        [Authorize(Roles = "Student,Admin,Teacher")]
        public async Task<IActionResult> GetStudentAttendanceSummary(string studentId)
        {
            // If the user is a student, ensure they are only requesting their own attendance
            if (User.IsInRole("Student"))
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId != studentId) return Forbid();
            }

            var summary = await _attendanceService.GetStudentAttendanceSummaryAsync(studentId);
            return Ok(summary);
        }
    }
}
