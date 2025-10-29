# ============================================
# Library Management System - Startup Script
# ============================================

Write-Host "`n🚀 Starting Library Management System (SOA + Consul)..." -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Check if Consul is installed
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
try {
    $consulVersion = consul version 2>&1 | Select-String "Consul v"
    Write-Host "✅ Consul installed: $consulVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Consul not found! Please install Consul first." -ForegroundColor Red
    Write-Host "   Download: https://www.consul.io/downloads`n" -ForegroundColor Yellow
    exit 1
}

# Check if running in project root
if (-not (Test-Path ".\backend") -or -not (Test-Path ".\frontend")) {
    Write-Host "❌ Please run this script from project root directory!" -ForegroundColor Red
    Write-Host "   Current: $PWD" -ForegroundColor Yellow
    Write-Host "   Expected: D:\SOA_giuaki\LibraryManagement`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ All prerequisites met!`n" -ForegroundColor Green

# Function to start process in new window
function Start-InNewWindow {
    param (
        [string]$Title,
        [string]$Command,
        [string]$WorkingDir = $PWD
    )
    
    $encodedCommand = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($Command))
    
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-EncodedCommand", $encodedCommand
    ) -WindowStyle Normal
    
    Write-Host "✅ Started: $Title" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

# 1. Start Consul
Write-Host "`n1️⃣  Starting Consul Server..." -ForegroundColor Cyan
Start-InNewWindow -Title "Consul Server" -Command @"
Write-Host '🏛️  CONSUL SERVER' -ForegroundColor Magenta
Write-Host '=================' -ForegroundColor Magenta
Write-Host ''
Write-Host 'Web UI: http://localhost:8500' -ForegroundColor Yellow
Write-Host 'Press Ctrl+C to stop' -ForegroundColor Gray
Write-Host ''
consul agent -dev
"@

Write-Host "⏳ Waiting for Consul to start (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 2. Start Backend (All services)
Write-Host "`n2️⃣  Starting Backend Services (API Gateway + 4 Services)..." -ForegroundColor Cyan
Start-InNewWindow -Title "Backend Services" -Command @"
Write-Host '⚙️  BACKEND SERVICES' -ForegroundColor Blue
Write-Host '===================' -ForegroundColor Blue
Write-Host ''
Write-Host 'Services starting:' -ForegroundColor Yellow
Write-Host '  • API Gateway (5000)' -ForegroundColor Gray
Write-Host '  • User Service (5001)' -ForegroundColor Gray
Write-Host '  • Book Service (5002)' -ForegroundColor Gray
Write-Host '  • Borrow Service (5003)' -ForegroundColor Gray
Write-Host '  • Logging Service (5004)' -ForegroundColor Gray
Write-Host ''
Set-Location '$PWD\backend'
npm run dev:all
"@

Write-Host "⏳ Waiting for backend to start (8 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# 3. Start Frontend
Write-Host "`n3️⃣  Starting Frontend..." -ForegroundColor Cyan
Start-InNewWindow -Title "Frontend" -Command @"
Write-Host '🎨 FRONTEND (React + Vite)' -ForegroundColor Green
Write-Host '===========================' -ForegroundColor Green
Write-Host ''
Write-Host 'Frontend URL: http://localhost:5173' -ForegroundColor Yellow
Write-Host 'Press Ctrl+C to stop' -ForegroundColor Gray
Write-Host ''
Set-Location '$PWD\frontend'
npm run dev
"@

Write-Host "⏳ Waiting for frontend to start (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Summary
Write-Host "`n" -NoNewline
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ SYSTEM STARTED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Access Points:" -ForegroundColor Yellow
Write-Host "   🌐 Frontend:      http://localhost:5173" -ForegroundColor White
Write-Host "   🔀 API Gateway:   http://localhost:5000" -ForegroundColor White
Write-Host "   🏛️  Consul UI:     http://localhost:8500" -ForegroundColor White
Write-Host ""
Write-Host "📊 Services Running:" -ForegroundColor Yellow
Write-Host "   • API Gateway     (Port 5000)" -ForegroundColor Gray
Write-Host "   • User Service    (Port 5001)" -ForegroundColor Gray
Write-Host "   • Book Service    (Port 5002)" -ForegroundColor Gray
Write-Host "   • Borrow Service  (Port 5003)" -ForegroundColor Gray
Write-Host "   • Logging Service (Port 5004)" -ForegroundColor Gray
Write-Host ""
Write-Host "🔍 Verify Services:" -ForegroundColor Yellow
Write-Host "   Check Consul UI: http://localhost:8500/ui/dc1/services" -ForegroundColor Cyan
Write-Host "   Check Health:    http://localhost:5000/health" -ForegroundColor Cyan
Write-Host "   Check Registry:  http://localhost:5000/registry" -ForegroundColor Cyan
Write-Host ""
Write-Host "🛑 To Stop All:" -ForegroundColor Yellow
Write-Host "   Close all opened PowerShell windows" -ForegroundColor Gray
Write-Host "   Or press Ctrl+C in each window" -ForegroundColor Gray
Write-Host ""
Write-Host "================================================`n" -ForegroundColor Cyan

# Keep this window open
Write-Host "Press any key to close this window..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
