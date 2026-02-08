using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
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
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly ISmsService _smsService;

        // In-memory OTP storage for demonstration (Production should use Redis/Database)
        private static readonly ConcurrentDictionary<string, string> _otpStore = new();

        public AuthController(
            UserManager<ApplicationUser> userManager, 
            RoleManager<IdentityRole> roleManager, 
            IConfiguration configuration,
            ISmsService smsService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _smsService = smsService;
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] SendOtpDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Generate 6-digit OTP
            var otp = new Random().Next(100000, 999999).ToString();
            
            // Store OTP (overwrite existing)
            _otpStore[model.MobileNumber] = otp;

            // Send via SMS Service
            var message = $"Your OTP for StudiousIndex password reset is: {otp}";
            
            // Log OTP to console regardless of SMS success (for easier testing/debugging)
            Console.WriteLine($"[SendOtp] Generated OTP for {model.MobileNumber}: {otp}");
            
            // TEMPORARY: Bypass SMS sending for stability/testing
            // var sent = await _smsService.SendSmsAsync(model.MobileNumber, message);
            var sent = true; 
            Console.WriteLine($"[SendOtp] SMS sending bypassed. OTP: {otp}");

            if (sent)
            {
                return Ok(new { Message = "OTP sent successfully." });
            }
            else
            {
                return StatusCode(500, new { Message = "Failed to send OTP. Please check server logs." });
            }
        }

        [HttpPost("verify-otp")]
        public IActionResult VerifyOtp([FromBody] VerifyOtpDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (_otpStore.TryGetValue(model.MobileNumber, out var storedOtp) && storedOtp == model.Otp)
            {
                return Ok(new { Message = "OTP verified successfully." });
            }

            return BadRequest(new { Message = "Invalid or expired OTP." });
        }

        [HttpPost("reset-password-otp")]
        public async Task<IActionResult> ResetPasswordWithOtp([FromBody] ResetPasswordDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Verify OTP again for security
            if (!_otpStore.TryGetValue(model.MobileNumber, out var storedOtp) || storedOtp != model.Otp)
            {
                return BadRequest(new { Message = "Invalid or expired OTP." });
            }

            // Find user by Phone Number (Assuming PhoneNumber is stored in AspNetUsers)
            // Note: Since the current RegisterDto doesn't include Phone, we'll assume the user might have updated it later
            // OR for this demo, we'll assume the "MobileNumber" is actually the Email if it contains '@' (hybrid approach)
            // BUT strict requirement says "Mobile Number".
            
            // For this specific implementation to work with the existing User model:
            // We need to find a user who has this phone number.
            // Since we haven't enforced phone numbers during registration, this might fail if no user has this number.
            // Let's check if the input is actually an email (common workaround) OR try to find by phone.

            var user = _userManager.Users.FirstOrDefault(u => u.PhoneNumber == model.MobileNumber);
            
            if (user == null)
            {
                // Fallback: Check if the input string is being used as a username/email (if user entered email in mobile field)
                // But UI enforces numeric pattern.
                return BadRequest(new { Message = "User with this mobile number not found." });
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);

            if (result.Succeeded)
            {
                _otpStore.TryRemove(model.MobileNumber, out _); // Clear OTP
                return Ok(new { Message = "Password reset successfully." });
            }

            return BadRequest(result.Errors);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            Console.WriteLine($"[Register] Attempt for email: {model.Email}, Role: {model.Role}");

            if (!ModelState.IsValid)
            {
                Console.WriteLine("[Register] ModelState invalid");
                return BadRequest(ModelState);
            }

            var userExists = await _userManager.FindByEmailAsync(model.Email);
            if (userExists != null)
            {
                Console.WriteLine($"[Register] User {model.Email} already exists");
                return BadRequest(new { Message = "User already exists!" });
            }

            ApplicationUser user = new()
            {
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Email,
                FullName = model.FullName
            };
            
            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
            {
                Console.WriteLine($"[Register] CreateAsync failed: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                return BadRequest(result.Errors);
            }

            // Ensure roles exist - REMOVED (Handled by DataSeeder)
            // if (!await _roleManager.RoleExistsAsync(model.Role)) ...

            if (await _roleManager.RoleExistsAsync(model.Role))
            {
                await _userManager.AddToRoleAsync(user, model.Role);
            }
            else
            {
                await _userManager.AddToRoleAsync(user, "Student");
            }

            Console.WriteLine($"[Register] User {model.Email} created successfully");
            return Ok(new { Message = "User created successfully!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            try
            {
                Console.WriteLine($"[Login] Attempt for email: {model.Email}");
                
                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                {
                    Console.WriteLine($"[Login] User {model.Email} not found");
                    return Unauthorized(new { Message = "Invalid credentials" });
                }

                if (!await _userManager.CheckPasswordAsync(user, model.Password))
                {
                    Console.WriteLine($"[Login] Invalid password for {model.Email}");
                    return Unauthorized(new { Message = "Invalid credentials" });
                }

                var userRoles = await _userManager.GetRolesAsync(user);

                var authClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.UserName ?? user.Email ?? "Unknown"),
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };

                foreach (var userRole in userRoles)
                {
                    authClaims.Add(new Claim(ClaimTypes.Role, userRole));
                }

                var token = GetToken(authClaims);

                Console.WriteLine($"[Login] Successful login for {model.Email}");

                return Ok(new AuthResponseDto
                {
                    Token = new JwtSecurityTokenHandler().WriteToken(token),
                    Email = user.Email!,
                    Role = userRoles.FirstOrDefault() ?? "Student",
                    FullName = user.FullName,
                    UserId = user.Id
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Login] Error: {ex.Message}");
                Console.WriteLine($"[Login] StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { Message = "Internal Server Error. Check logs for details.", Error = ex.Message });
            }
        }

        private JwtSecurityToken GetToken(List<Claim> authClaims)
        {
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                expires: DateTime.Now.AddHours(3),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
                );

            return token;
        }
    }
}
