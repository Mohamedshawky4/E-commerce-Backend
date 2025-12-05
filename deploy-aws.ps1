# Deploy with Environment Variables
# This script loads .env variables and deploys to AWS

Write-Host "Deploying to AWS Lambda with environment variables..." -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-Not (Test-Path ".env")) {
    Write-Host "Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with your environment variables." -ForegroundColor Yellow
    exit 1
}

# Load environment variables from .env file
Write-Host "Loading environment variables from .env..." -ForegroundColor Yellow

Get-Content .env | ForEach-Object {
    $line = $_.Trim()
    
    # Skip empty lines and comments
    if ($line -eq "" -or $line.StartsWith("#")) {
        return
    }
    
    # Parse KEY=VALUE
    $parts = $line.Split('=', 2)
    if ($parts.Length -eq 2) {
        $name = $parts[0].Trim()
        $value = $parts[1].Trim()
        
        # Remove surrounding quotes if present
        if ($value.StartsWith('"') -and $value.EndsWith('"')) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        if ($value.StartsWith("'") -and $value.EndsWith("'")) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        
        # Set environment variable
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
        Write-Host "  Loaded: $name" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Deploying to AWS..." -ForegroundColor Cyan
Write-Host ""

# Deploy
npm run deploy

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
