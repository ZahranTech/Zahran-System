$ErrorActionPreference = "Stop"

$flutterUrl = "https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.19.0-stable.zip"
$zipPath = "frontend/flutter_sdk.zip"
$destDir = "C:\src"

Write-Host "Started Installing Flutter..."

# 1. Download
if (-not (Test-Path $zipPath)) {
    Write-Host "Downloading Flutter SDK... (This may take a few minutes)"
    Invoke-WebRequest -Uri $flutterUrl -OutFile $zipPath
} else {
    Write-Host "Zip already exists, skipping download."
}

# 2. Extract
if (-not (Test-Path "$destDir\flutter")) {
    Write-Host "Extracting to $destDir..."
    Expand-Archive -Path $zipPath -DestinationPath $destDir -Force
} else {
    Write-Host "Flutter directory already exists."
}

# 3. Path
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User)
$flutterBin = "$destDir\flutter\bin"

if ($currentPath -notlike "*$flutterBin*") {
    Write-Host "Adding Flutter to User Path..."
    [System.Environment]::SetEnvironmentVariable("Path", $currentPath + ";$flutterBin", [System.EnvironmentVariableTarget]::User)
    Write-Host "Path updated."
} else {
    Write-Host "Flutter is already in Path."
}

Write-Host "🎉 Installation Complete!"
Write-Host "IMPORTANT: You MUST restart your terminal (close and open) for changes to take effect."
