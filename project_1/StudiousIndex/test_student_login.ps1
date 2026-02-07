$body = @{
    email = "student@studiousindex.com"
    password = "Student@123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5131/api/Auth/login" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Login Successful!"
    Write-Host "Token: $($response.token)"
} catch {
    Write-Host "Login Failed!"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Response Body: $($reader.ReadToEnd())"
    }
}
