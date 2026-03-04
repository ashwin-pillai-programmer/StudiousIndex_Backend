using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudiousIndex.API.DTOs;
using StudiousIndex.Data;
using StudiousIndex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace StudiousIndex.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VideoLecturesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VideoLecturesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/videolectures (Teacher)
        [HttpPost]
        public async Task<IActionResult> CreateVideoLecture([FromBody] CreateVideoLectureDto model)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            // If no user is logged in, use the default teacher from seeding
            if (string.IsNullOrEmpty(teacherId))
            {
                var defaultTeacher = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == "teacher@studiousindex.com");
                teacherId = defaultTeacher?.Id;
            }

            if (string.IsNullOrEmpty(teacherId))
                return Unauthorized("Teacher account not found. Please ensure database is seeded.");

            var videoLecture = new VideoLecture
            {
                Id = Guid.NewGuid(),
                Title = model.Title,
                ClassLevel = model.ClassLevel,
                Subject = model.Subject,
                VideoUrl = model.VideoUrl,
                IsApproved = true, // Auto-approve for immediate visibility
                CreatedByTeacherId = teacherId,
                CreatedAt = DateTime.UtcNow
            };

            _context.VideoLectures.Add(videoLecture);
            await _context.SaveChangesAsync();

            return Ok(new VideoLectureResponseDto
            {
                Id = videoLecture.Id,
                Title = videoLecture.Title,
                ClassLevel = videoLecture.ClassLevel,
                Subject = videoLecture.Subject,
                VideoUrl = videoLecture.VideoUrl,
                IsApproved = videoLecture.IsApproved,
                CreatedByTeacherId = videoLecture.CreatedByTeacherId,
                CreatedAt = videoLecture.CreatedAt
            });
        }

        // PUT: api/videolectures/{id}/approve (Admin)
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveVideoLecture(Guid id)
        {
            var videoLecture = await _context.VideoLectures.FindAsync(id);
            if (videoLecture == null)
                return NotFound();

            videoLecture.IsApproved = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Video lecture approved successfully" });
        }

        // GET: api/videolectures (Student)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VideoLectureResponseDto>>> GetApprovedVideoLectures(
            [FromQuery] string? classLevel, 
            [FromQuery] string? subject,
            [FromQuery] string? search)
        {
            var query = _context.VideoLectures
                .Where(v => v.IsApproved);

            if (!string.IsNullOrEmpty(classLevel))
                query = query.Where(v => v.ClassLevel == classLevel);

            if (!string.IsNullOrEmpty(subject))
                query = query.Where(v => v.Subject.ToLower() == subject.ToLower());

            if (!string.IsNullOrEmpty(search))
                query = query.Where(v => v.Title.ToLower().Contains(search.ToLower()));

            var lectures = await query
                .Select(v => new VideoLectureResponseDto
                {
                    Id = v.Id,
                    Title = v.Title,
                    ClassLevel = v.ClassLevel,
                    Subject = v.Subject,
                    VideoUrl = v.VideoUrl,
                    IsApproved = v.IsApproved,
                    CreatedByTeacherId = v.CreatedByTeacherId,
                    CreatedAt = v.CreatedAt
                })
                .ToListAsync();

            return Ok(lectures);
        }

        // GET: api/videolectures/pending (Admin)
        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<VideoLectureResponseDto>>> GetPendingVideoLectures()
        {
            var lectures = await _context.VideoLectures
                .Where(v => !v.IsApproved)
                .Select(v => new VideoLectureResponseDto
                {
                    Id = v.Id,
                    Title = v.Title,
                    ClassLevel = v.ClassLevel,
                    Subject = v.Subject,
                    VideoUrl = v.VideoUrl,
                    IsApproved = v.IsApproved,
                    CreatedByTeacherId = v.CreatedByTeacherId,
                    CreatedAt = v.CreatedAt
                })
                .ToListAsync();

            return Ok(lectures);
        }

        // DELETE: api/videolectures/{id} (Admin)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVideoLecture(Guid id)
        {
            var videoLecture = await _context.VideoLectures.FindAsync(id);
            if (videoLecture == null)
                return NotFound();

            _context.VideoLectures.Remove(videoLecture);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Video lecture deleted successfully" });
        }
    }
}
