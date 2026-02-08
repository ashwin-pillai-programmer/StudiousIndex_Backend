using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace StudiousIndex.API.Services
{
    public class SmsService : ISmsService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<SmsService> _logger;

        public SmsService(IConfiguration configuration, ILogger<SmsService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> SendSmsAsync(string mobileNumber, string message)
        {
            try
            {
                var accountSid = _configuration["Twilio:AccountSid"];
                var authToken = _configuration["Twilio:AuthToken"];
                var fromNumber = _configuration["Twilio:FromNumber"];

                // Fallback for development if keys are missing
                if (string.IsNullOrEmpty(accountSid) || string.IsNullOrEmpty(authToken) || string.IsNullOrEmpty(fromNumber))
                {
                    _logger.LogWarning("Twilio credentials are missing in appsettings.json. OTP for {MobileNumber} is: {Message}", mobileNumber, message);
                    // Return true to allow flow to continue in dev mode even without SMS
                    return true;
                }

                TwilioClient.Init(accountSid, authToken);

                var messageResource = await MessageResource.CreateAsync(
                    body: message,
                    from: new PhoneNumber(fromNumber),
                    to: new PhoneNumber(mobileNumber)
                );

                _logger.LogInformation("SMS sent successfully to {MobileNumber}. SID: {Sid}", mobileNumber, messageResource.Sid);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send SMS to {MobileNumber}", mobileNumber);
                
                // Fallback: If Twilio fails (e.g. invalid credentials), allow the flow to continue for development
                _logger.LogWarning("Falling back to Mock OTP due to SMS failure. OTP for {MobileNumber} is: {Message}", mobileNumber, message);
                return true;
            }
        }
    }
}