using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StudiousIndex.Data;
using StudiousIndex.Domain.Entities;

namespace StudiousIndex.API
{
    public static class DataSeeder
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var context = serviceProvider.GetRequiredService<ApplicationDbContext>();

            string[] roles = { "Admin", "Teacher", "Student" };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            await EnsureUserAsync(userManager, "teacher@studiousindex.com", "Default Teacher", "Teacher@123", "Teacher");
            await EnsureUserAsync(userManager, "student@studiousindex.com", "Default Student", "Student@123", "Student", "8422939033");

            await SeedExams(context, userManager);
            await SeedVideos(context, userManager);
        }

        private static async Task SeedExams(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            if (await context.Exams.AnyAsync()) return;

            var teacher = await userManager.FindByEmailAsync("teacher@studiousindex.com");
            if (teacher == null) return;

            var exams = new List<Exam>
            {
                new Exam
                {
                    Title = "General Science Quiz",
                    Description = "Basic science questions for practice.",
                    DurationMinutes = 15,
                    Grade = "Class 5",
                    Board = "CBSE",
                    ScheduledDate = DateTime.UtcNow.AddDays(1),
                    IsApproved = true,
                    IsActive = true,
                    CreatedByUserId = teacher.Id,
                    Questions = new List<Question>
                    {
                        new Question { Text = "What planet is known as the Red Planet?", Marks = 5, Options = new List<Option> { new Option { Text = "Mars", IsCorrect = true }, new Option { Text = "Venus", IsCorrect = false }, new Option { Text = "Jupiter", IsCorrect = false } } },
                        new Question { Text = "What is the boiling point of water?", Marks = 5, Options = new List<Option> { new Option { Text = "100°C", IsCorrect = true }, new Option { Text = "0°C", IsCorrect = false }, new Option { Text = "50°C", IsCorrect = false } } }
                    }
                },
                new Exam
                {
                    Title = "Mathematics Basics",
                    Description = "Simple addition and multiplication.",
                    DurationMinutes = 10,
                    Grade = "Class 3",
                    Board = "ICSE",
                    ScheduledDate = DateTime.UtcNow.AddDays(2),
                    IsApproved = true,
                    IsActive = true,
                    CreatedByUserId = teacher.Id,
                    Questions = new List<Question>
                    {
                        new Question { Text = "What is 15 + 27?", Marks = 5, Options = new List<Option> { new Option { Text = "42", IsCorrect = true }, new Option { Text = "32", IsCorrect = false }, new Option { Text = "52", IsCorrect = false } } },
                        new Question { Text = "What is 8 x 7?", Marks = 5, Options = new List<Option> { new Option { Text = "56", IsCorrect = true }, new Option { Text = "64", IsCorrect = false }, new Option { Text = "48", IsCorrect = false } } }
                    }
                }
            };

            context.Exams.AddRange(exams);
            await context.SaveChangesAsync();
        }

        private static async Task SeedVideos(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            // Only seed if no videos exist, to avoid duplicates and preserve user-created content
            if (await context.VideoLectures.AnyAsync()) return;

            var teacher = await userManager.FindByEmailAsync("teacher@studiousindex.com");
            if (teacher == null) return;

            var videos = new List<VideoLecture>
            {
                // CLASS 1-12 (School)
                new VideoLecture { Id = Guid.NewGuid(), Title = "Counting Numbers 1-10", ClassLevel = "Class 1", Subject = "Math", VideoUrl = "D0Ajq682yrA", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                new VideoLecture { Id = Guid.NewGuid(), Title = "Basic Addition for Kids", ClassLevel = "Class 1", Subject = "Math", VideoUrl = "UqYmX9U-Ddk", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                new VideoLecture { Id = Guid.NewGuid(), Title = "Parts of a Plant", ClassLevel = "Class 2", Subject = "Science", VideoUrl = "pB4ASdELBbQ", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                new VideoLecture { Id = Guid.NewGuid(), Title = "The Solar System for Kids", ClassLevel = "Class 3", Subject = "Science", VideoUrl = "libKVRa01L8", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                new VideoLecture { Id = Guid.NewGuid(), Title = "Digestive System - How it works", ClassLevel = "Class 5", Subject = "Science", VideoUrl = "Og5xAdC8EUI", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                new VideoLecture { Id = Guid.NewGuid(), Title = "Photosynthesis Explained", ClassLevel = "Class 6", Subject = "Science", VideoUrl = "UPBMG5EYPDo", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                new VideoLecture { Id = Guid.NewGuid(), Title = "Algebra Basics: What Is Algebra?", ClassLevel = "Class 7", Subject = "Math", VideoUrl = "NybHckSEQBI", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                new VideoLecture { Id = Guid.NewGuid(), Title = "Periodic Table Basics", ClassLevel = "Class 9", Subject = "Chemistry", VideoUrl = "0RRVV4Diomg", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                new VideoLecture { Id = Guid.NewGuid(), Title = "Cell Theory - Biology", ClassLevel = "Class 9", Subject = "Biology", VideoUrl = "4OpBylwH9DU", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                new VideoLecture { Id = Guid.NewGuid(), Title = "Quadratic Equations", ClassLevel = "Class 10", Subject = "Math", VideoUrl = "X6BfW_u1W1E", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                new VideoLecture { Id = Guid.NewGuid(), Title = "Newton's Laws of Motion", ClassLevel = "Class 11", Subject = "Physics", VideoUrl = "kKKM8Y-u7ds", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                new VideoLecture { Id = Guid.NewGuid(), Title = "Electromagnetic Induction", ClassLevel = "Class 12", Subject = "Physics", VideoUrl = "pQ8rev79_qU", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                new VideoLecture { Id = Guid.NewGuid(), Title = "DNA Structure and Replication", ClassLevel = "Class 12", Subject = "Biology", VideoUrl = "8kK2zwjRV0M", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                
                // BSc COURSES (College)
                new VideoLecture { Id = Guid.NewGuid(), Title = "Introduction to Data Structures", ClassLevel = "BSc Computer Science", Subject = "Computer Science", VideoUrl = "8hly31xKli0", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                new VideoLecture { Id = Guid.NewGuid(), Title = "Operating Systems Concepts", ClassLevel = "BSc Computer Science", Subject = "Computer Science", VideoUrl = "vBURTt97EkA", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                new VideoLecture { Id = Guid.NewGuid(), Title = "Python for Beginners", ClassLevel = "BSc Computer Science", Subject = "Programming", VideoUrl = "_uQrJ0TkZlc", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                new VideoLecture { Id = Guid.NewGuid(), Title = "Quantum Mechanics Basics", ClassLevel = "BSc Physics", Subject = "Physics", VideoUrl = "7Y-u2nI7_X4", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                new VideoLecture { Id = Guid.NewGuid(), Title = "Linear Algebra Full Course", ClassLevel = "BSc Mathematics", Subject = "Math", VideoUrl = "JnTa9X9pXkU", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                new VideoLecture { Id = Guid.NewGuid(), Title = "Organic Chemistry Introduction", ClassLevel = "BSc Chemistry", Subject = "Chemistry", VideoUrl = "b-fT-t3M_1Y", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                new VideoLecture { Id = Guid.NewGuid(), Title = "Database Management Systems", ClassLevel = "BSc IT", Subject = "Information Technology", VideoUrl = "HXV3zeQKqGY", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow },
                new VideoLecture { Id = Guid.NewGuid(), Title = "What is Cloud Computing?", ClassLevel = "BSc IT", Subject = "Information Technology", VideoUrl = "2LaAJq1lB1Q", IsApproved = true, CreatedByTeacherId = teacher.Id, CreatedAt = DateTime.UtcNow }
            };

            context.VideoLectures.AddRange(videos);
            await context.SaveChangesAsync();
        }

        private static async Task EnsureUserAsync(UserManager<ApplicationUser> userManager, string email, string fullName, string password, string role, string? phoneNumber = null)
        {
            Console.WriteLine($"Seeding user: {email}...");
            var user = await userManager.FindByEmailAsync(email);

            if (user == null)
            {
                user = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    FullName = fullName,
                    IsActive = true,
                    EmailConfirmed = true,
                    PhoneNumber = phoneNumber
                };

                var createResult = await userManager.CreateAsync(user, password);
                if (createResult.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, role);
                    Console.WriteLine($"User {email} created successfully.");
                }
                else
                {
                    Console.WriteLine($"Error creating user {email}: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
                }
            }
            else
            {
                // Ensure user is in the correct role
                if (!await userManager.IsInRoleAsync(user, role))
                {
                    await userManager.AddToRoleAsync(user, role);
                }

                // Update phone number if provided and different
                if (!string.IsNullOrEmpty(phoneNumber) && user.PhoneNumber != phoneNumber)
                {
                    user.PhoneNumber = phoneNumber;
                    await userManager.UpdateAsync(user);
                }
            }
        }
    }
}
