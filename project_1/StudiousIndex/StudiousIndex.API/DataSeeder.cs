using Microsoft.AspNetCore.Identity;
using StudiousIndex.Domain.Entities;

namespace StudiousIndex.API
{
    public static class DataSeeder
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            string[] roles = { "Admin", "Teacher", "Student" };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            // Create Admin User
            var adminEmail = "admin@studiousindex.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                var admin = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FullName = "System Admin",
                    IsActive = true,
                    EmailConfirmed = true
                };

                var createResult = await userManager.CreateAsync(admin, "Admin@123");
                if (createResult.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, "Admin");
                }
            }

            // Create Teacher User
            var teacherEmail = "teacher@studiousindex.com";
            var teacherUser = await userManager.FindByEmailAsync(teacherEmail);

            if (teacherUser == null)
            {
                var teacher = new ApplicationUser
                {
                    UserName = teacherEmail,
                    Email = teacherEmail,
                    FullName = "Default Teacher",
                    IsActive = true,
                    EmailConfirmed = true
                };

                var createResult = await userManager.CreateAsync(teacher, "Teacher@123");
                if (createResult.Succeeded)
                {
                    await userManager.AddToRoleAsync(teacher, "Teacher");
                }
            }

            // Create Student User
            var studentEmail = "student@studiousindex.com";
            var studentUser = await userManager.FindByEmailAsync(studentEmail);

            if (studentUser == null)
            {
                var student = new ApplicationUser
                {
                    UserName = studentEmail,
                    Email = studentEmail,
                    FullName = "Default Student",
                    IsActive = true,
                    EmailConfirmed = true
                };

                var createResult = await userManager.CreateAsync(student, "Student@123");
                if (createResult.Succeeded)
                {
                    await userManager.AddToRoleAsync(student, "Student");
                }
            }
        }
    }
}
