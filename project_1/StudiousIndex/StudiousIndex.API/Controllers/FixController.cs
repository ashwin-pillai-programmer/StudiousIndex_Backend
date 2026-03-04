using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using StudiousIndex.Domain.Entities;
using StudiousIndex.Data;
using Microsoft.EntityFrameworkCore;

namespace StudiousIndex.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FixController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public FixController(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        [HttpPost("reset-admin")]
        public async Task<IActionResult> ResetAdmin()
        {
            try
            {
                // 1. Fix IsActive for all users
                var allUsers = await _context.Users.ToListAsync();
                foreach (var u in allUsers)
                {
                    u.IsActive = true;
                }
                await _context.SaveChangesAsync();

                // 2. Ensure Admin exists and reset password
                var adminEmail = "admin@studiousindex.com";
                var adminUser = await _userManager.FindByEmailAsync(adminEmail);

                if (adminUser == null)
                {
                    adminUser = new ApplicationUser
                    {
                        UserName = adminEmail,
                        Email = adminEmail,
                        FullName = "System Admin",
                        IsActive = true,
                        EmailConfirmed = true
                    };
                    var createResult = await _userManager.CreateAsync(adminUser, "Admin@123");
                    if (!createResult.Succeeded)
                        return BadRequest(createResult.Errors);
                        
                    await _userManager.AddToRoleAsync(adminUser, "Admin");
                }
                else
                {
                    // Force reset password
                    var token = await _userManager.GeneratePasswordResetTokenAsync(adminUser);
                    var resetResult = await _userManager.ResetPasswordAsync(adminUser, token, "Admin@123");
                    if (!resetResult.Succeeded)
                        return BadRequest(resetResult.Errors);
                }

                return Ok(new { Message = "Admin user fixed (admin@studiousindex.com / Admin@123) and all users activated." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("exams-to-today")]
        public async Task<IActionResult> FixExamsForToday()
        {
            try
            {
                var exams = await _context.Exams.ToListAsync();
                var today = DateTime.Today.AddHours(10); // 10 AM today
                foreach (var e in exams)
                {
                    e.ScheduledDate = today;
                    e.IsApproved = true;
                    e.IsActive = true;
                }
                await _context.SaveChangesAsync();
                return Ok(new { Message = "All exams moved to today 10 AM for notification testing." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
