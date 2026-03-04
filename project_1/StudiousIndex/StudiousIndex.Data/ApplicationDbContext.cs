using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using StudiousIndex.Domain.Entities;

namespace StudiousIndex.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Exam> Exams { get; set; } = null!;
        public DbSet<Question> Questions { get; set; } = null!;
        public DbSet<Option> Options { get; set; } = null!;
        public DbSet<StudentExam> StudentExams { get; set; } = null!;
        public DbSet<StudentExamAnswer> StudentExamAnswers { get; set; } = null!;
        public DbSet<VideoLecture> VideoLectures { get; set; } = null!;
        public DbSet<StudentResult> StudentResults { get; set; } = null!;
        public DbSet<SubjectResult> SubjectResults { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<AttendanceSession> AttendanceSessions { get; set; } = null!;
        public DbSet<StudentAttendance> StudentAttendances { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<AttendanceSession>()
                .HasOne(a => a.CreatedByTeacher)
                .WithMany()
                .HasForeignKey(a => a.CreatedByTeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<StudentAttendance>()
                .HasOne(s => s.Student)
                .WithMany()
                .HasForeignKey(s => s.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<StudentAttendance>()
                .HasOne(s => s.AttendanceSession)
                .WithMany(a => a.StudentAttendances)
                .HasForeignKey(s => s.AttendanceSessionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<VideoLecture>()
                .HasOne(v => v.CreatedByTeacher)
                .WithMany()
                .HasForeignKey(v => v.CreatedByTeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Exam>()
                .HasOne(e => e.CreatedByUser)
                .WithMany()
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Question>()
                .HasOne(q => q.Exam)
                .WithMany(e => e.Questions)
                .HasForeignKey(q => q.ExamId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Option>()
                .HasOne(o => o.Question)
                .WithMany(q => q.Options)
                .HasForeignKey(o => o.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);
                
            builder.Entity<StudentExam>()
                .HasOne(se => se.Student)
                .WithMany()
                .HasForeignKey(se => se.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
                
            builder.Entity<StudentExam>()
                .HasOne(se => se.Exam)
                .WithMany()
                .HasForeignKey(se => se.ExamId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<StudentExamAnswer>()
                .HasOne(sea => sea.StudentExam)
                .WithMany(se => se.Answers)
                .HasForeignKey(sea => sea.StudentExamId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<StudentExamAnswer>()
                .HasOne(sea => sea.Question)
                .WithMany()
                .HasForeignKey(sea => sea.QuestionId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<StudentExamAnswer>()
                .HasOne(sea => sea.SelectedOption)
                .WithMany()
                .HasForeignKey(sea => sea.SelectedOptionId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<StudentResult>()
                .HasOne(sr => sr.Student)
                .WithMany()
                .HasForeignKey(sr => sr.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<SubjectResult>()
                .HasOne(sur => sur.StudentResult)
                .WithMany(sr => sr.SubjectResults)
                .HasForeignKey(sur => sur.StudentResultId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
