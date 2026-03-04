using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StudiousIndex.API.DTOs;
using StudiousIndex.API.Services;
using StudiousIndex.Domain.Entities;
using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace StudiousIndex.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly ISmsService _smsService;
        private readonly IWebHostEnvironment _env;

        private static readonly ConcurrentDictionary<string, (string Otp, DateTime Expiry)> _otpStore = new();

        public AuthController(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration,
            ISmsService smsService,
            IWebHostEnvironment env)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _smsService = smsService;
            _env = env;
        }

        // ================= REGISTER =================

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userExists = await _userManager.FindByEmailAsync(model.Email);
            if (userExists != null)
                return BadRequest(new { message = "User already exists" });

            var user = new ApplicationUser
            {
                Email = model.Email,
                UserName = model.Email,
                FullName = model.FullName,
                EmailConfirmed = true,
                IsActive = false,
                RollNumber = model.RollNumber ?? string.Empty,
                DateOfBirth = model.DateOfBirth,
                CollegeName = model.CollegeName
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            var targetRole = model.Role;
            if (string.IsNullOrWhiteSpace(targetRole))
            {
                targetRole = "Admin";
            }

            var anyAdmin = await _userManager.GetUsersInRoleAsync("Admin");
            if (targetRole == "Admin" && anyAdmin.Count == 0)
            {
                user.IsActive = true;
                await _userManager.AddToRoleAsync(user, "Admin");
            }
            else
            {
                if (targetRole != "Admin" && targetRole != "Teacher" && targetRole != "Student")
                {
                    targetRole = "Student";
                }

                await _userManager.AddToRoleAsync(user, targetRole);

                if (targetRole == "Admin")
                {
                    user.IsActive = true;
                    await _userManager.UpdateAsync(user);
                }
            }

            return Ok(new { message = "User created successfully. You can now login." });
        }

        // ================= LOGIN =================

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto model)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(model.Email);

                if (user == null)
                    return Unauthorized(new { message = "Invalid credentials" });

                var rolesForCheck = await _userManager.GetRolesAsync(user);
                var isAdmin = rolesForCheck.Contains("Admin");

                if (!user.IsActive && !isAdmin)
                    return Unauthorized(new { message = "Account is not yet approved by Admin." });

                var passwordValid = await _userManager.CheckPasswordAsync(user, model.Password);
                if (!passwordValid)
                    return Unauthorized(new { message = "Invalid credentials" });

                var roles = rolesForCheck;
                if (roles == null || !roles.Any())
                    return Unauthorized(new { message = "User has no role assigned" });

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Email, user.Email!),
                    new Claim(ClaimTypes.Name, user.FullName ?? user.Email!)
                };

                foreach (var role in roles)
                    claims.Add(new Claim(ClaimTypes.Role, role));

                var jwtToken = GenerateJwtToken(claims);

                var tokenString = new JwtSecurityTokenHandler().WriteToken(jwtToken);

                return Ok(new
                {
                    token = tokenString,
                    email = user.Email,
                    role = roles.First()
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[LOGIN ERROR] {ex}");
                return StatusCode(500, new
                {
                    message = "Internal Server Error",
                    error = ex.Message
                });
            }
        }

        // ================= OTP SEND =================

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] SendOtpDto model)
        {
            var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.PhoneNumber == model.MobileNumber);

            if (user == null)
                return BadRequest(new { message = "No account found with this mobile number." });

            var otp = new Random().Next(100000, 999999).ToString();
            _otpStore[model.MobileNumber] = (otp, DateTime.UtcNow.AddMinutes(2));

            Console.WriteLine($"OTP for {model.MobileNumber}: {otp}");

            if (_env.IsDevelopment())
            {
                return Ok(new
                {
                    message = "OTP generated (Dev Mode)",
                    otp = otp
                });
            }

            return Ok(new { message = "OTP sent successfully." });
        }

        // ================= VERIFY OTP =================

        [HttpPost("verify-otp")]
        public IActionResult VerifyOtp([FromBody] VerifyOtpDto model)
        {
            if (!_otpStore.TryGetValue(model.MobileNumber, out var entry))
                return BadRequest(new { message = "Invalid OTP" });

            if (DateTime.UtcNow > entry.Expiry)
                return BadRequest(new { message = "OTP expired" });

            if (entry.Otp != model.Otp)
                return BadRequest(new { message = "Invalid OTP" });

            return Ok(new { message = "OTP verified successfully" });
        }

        // ================= RESET PASSWORD =================

        [HttpPost("reset-password-otp")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
        {
            if (!_otpStore.TryGetValue(model.MobileNumber, out var entry))
                return BadRequest(new { message = "OTP invalid or expired" });

            if (DateTime.UtcNow > entry.Expiry || entry.Otp != model.Otp)
                return BadRequest(new { message = "OTP invalid or expired" });

            var user = await _userManager.Users
                .FirstOrDefaultAsync(u => u.PhoneNumber == model.MobileNumber);

            if (user == null)
                return BadRequest(new { message = "User not found" });

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            _otpStore.TryRemove(model.MobileNumber, out _);

            return Ok(new { message = "Password reset successful" });
        }

        // ================= JWT =================

        private JwtSecurityToken GenerateJwtToken(List<Claim> claims)
        {
            var key = _configuration["Jwt:Key"];
            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));

            return new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                expires: DateTime.UtcNow.AddHours(2),
                claims: claims,
                signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256)
            );
        }
    }
}
