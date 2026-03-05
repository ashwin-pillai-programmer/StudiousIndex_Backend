using StudiousIndex.API.DTOs;

namespace StudiousIndex.API.Services
{
    public interface IAttendanceService
    {
        Task<bool> MarkAttendanceAsync(MarkAttendanceDto model, string teacherId);
        Task<StudentAttendanceSummaryDto> GetStudentAttendanceSummaryAsync(string studentId);
    }
}
