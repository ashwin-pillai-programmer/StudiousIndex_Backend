using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudiousIndex.Data;
using StudiousIndex.Domain.Entities;
using System.Security.Claims;

namespace StudiousIndex.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NotificationController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyNotifications()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // 1. Get real notifications from DB
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId || string.IsNullOrEmpty(n.UserId))
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            // 2. Generate "virtual" exam notifications for today
            var today = DateTime.Today;
            var todayExams = await _context.Exams
                .Where(e => e.IsApproved && e.IsActive && e.ScheduledDate.Date == today)
                .ToListAsync();

            var examNotifications = todayExams.Select(e => new Notification
            {
                Id = -e.Id, // Negative ID to distinguish virtual notifications
                Title = "Exam Reminder",
                Message = $"Today is your '{e.Title}' exam. Scheduled time: {e.ScheduledDate:hh:mm tt}.",
                Type = "Exam",
                UserId = userId,
                CreatedAt = e.ScheduledDate.Date.AddHours(6), // Morning notification
                RelatedId = e.Id,
                IsRead = false
            });

            // Combine both
            var allNotifications = notifications.Concat(examNotifications)
                .OrderByDescending(n => n.CreatedAt)
                .ToList();

            return Ok(allNotifications);
        }

        [HttpPost("mark-read/{id:int}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            if (id <= 0) return Ok(); // Virtual notifications are implicitly read on frontend or just ignore

            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null) return NotFound();

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
