using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StudiousIndex.API.DTOs;
using StudiousIndex.Data;
using StudiousIndex.Domain.Entities;

namespace StudiousIndex.API.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public AttendanceService(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<bool> MarkAttendanceAsync(MarkAttendanceDto model, string teacherId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Create AttendanceSession
                var session = new AttendanceSession
                {
                    ClassLevel = model.ClassLevel,
                    Subject = model.Subject,
                    Date = model.Date,
                    CreatedByTeacherId = teacherId
                };

                _context.AttendanceSessions.Add(session);
                await _context.SaveChangesAsync();

                // 2. Create StudentAttendance records
                var attendances = model.Students.Select(s => new StudentAttendance
                {
                    StudentId = s.StudentId,
                    AttendanceSessionId = session.Id,
                    IsPresent = s.IsPresent
                }).ToList();

                _context.StudentAttendances.AddRange(attendances);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return false;
            }
        }

        public async Task<StudentAttendanceSummaryDto> GetStudentAttendanceSummaryAsync(string studentId)
        {
            var student = await _userManager.FindByIdAsync(studentId);
            if (student == null) return new StudentAttendanceSummaryDto();

            // Fetch all sessions for that student's class
            var sessions = await _context.AttendanceSessions
                .Where(s => s.ClassLevel == student.ClassLevel)
                .ToListAsync();

            var totalClasses = sessions.Count;
            if (totalClasses == 0) return new StudentAttendanceSummaryDto();

            // Count present classes for this student
            var presentClasses = await _context.StudentAttendances
                .CountAsync(a => a.StudentId == studentId && a.IsPresent);

            var absentClasses = totalClasses - presentClasses;
            var attendancePercentage = Math.Round((double)presentClasses / totalClasses * 100, 2);

            return new StudentAttendanceSummaryDto
            {
                TotalClasses = totalClasses,
                PresentClasses = presentClasses,
                AbsentClasses = absentClasses,
                AttendancePercentage = attendancePercentage,
                Status = attendancePercentage < 75 ? "Shortage" : "Eligible"
            };
        }
    }
}
