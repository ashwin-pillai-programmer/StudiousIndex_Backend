namespace StudiousIndex.API.Services
{
    public interface ISmsService
    {
        Task<bool> SendSmsAsync(string mobileNumber, string message);
    }
}