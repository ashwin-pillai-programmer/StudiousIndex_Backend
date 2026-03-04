using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudiousIndex.API.DTOs;
using StudiousIndex.API.Services;
using StudiousIndex.Data;
using System.Security.Claims;

namespace StudiousIndex.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly ApplicationDbContext _context;

        public ReportController(IReportService reportService, ApplicationDbContext context)
        {
            _reportService = reportService;
            _context = context;
        }

        [HttpPost("generate/{studentId}")]
        public async Task<ActionResult<StudentReportDto>> GenerateReport(string studentId)
        {
            var report = await _reportService.GenerateReportAsync(studentId);
            return Ok(report);
        }

        [HttpPost("generate")]
        public async Task<ActionResult<StudentReportDto>> GenerateMyReport()
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(studentId))
            {
                var student = await _context.Users.FirstOrDefaultAsync(u => u.Email == "student@studiousindex.com");
                studentId = student?.Id ?? _context.Users.First().Id;
            }

            var report = await _reportService.GenerateReportAsync(studentId);
            return Ok(report);
        }

        [HttpGet("{studentId}")]
        public async Task<ActionResult<StudentReportDto>> GetReport(string studentId)
        {
            var report = await _reportService.GetReportAsync(studentId);
            if (report == null) return NotFound();
            return Ok(report);
        }

        [HttpGet]
        public async Task<ActionResult<StudentReportDto>> GetMyReport()
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(studentId))
            {
                var student = await _context.Users.FirstOrDefaultAsync(u => u.Email == "student@studiousindex.com");
                studentId = student?.Id ?? _context.Users.First().Id;
            }

            var report = await _reportService.GetReportAsync(studentId);
            if (report == null) return NotFound();
            return Ok(report);
        }
    }
}

