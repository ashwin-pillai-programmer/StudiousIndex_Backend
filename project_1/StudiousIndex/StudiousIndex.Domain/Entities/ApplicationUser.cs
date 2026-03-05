using Microsoft.AspNetCore.Identity;

namespace StudiousIndex.Domain.Entities
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public string RollNumber { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public string CollegeName { get; set; } = string.Empty;
        public string ClassLevel { get; set; } = string.Empty;
    }
}
