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

            await EnsureUserAsync(userManager, "admin@studiousindex.com", "System Admin", "Admin@123", "Admin");
            await EnsureUserAsync(userManager, "teacher@studiousindex.com", "Default Teacher", "Teacher@123", "Teacher");
            await EnsureUserAsync(userManager, "student@studiousindex.com", "Default Student", "Student@123", "Student", "8422939033");
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
