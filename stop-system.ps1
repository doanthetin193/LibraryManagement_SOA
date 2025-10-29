# ============================================
# Library Management System - Stop Script
# ============================================

Write-Host "`n🛑 Stopping Library Management System..." -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Red

# Function to kill processes by port
function Stop-ProcessByPort {
    param (
        [int]$Port,
        [string]$ServiceName
    )
    
    try {
        $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
                   Select-Object -ExpandProperty OwningProcess -First 1
        
        if ($process) {
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Write-Host "✅ Stopped: $ServiceName (Port $Port)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Not running: $ServiceName (Port $Port)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Could not stop: $ServiceName (Port $Port)" -ForegroundColor Yellow
    }
}

# Stop services by port
Write-Host "Stopping services..." -ForegroundColor Cyan
Stop-ProcessByPort -Port 5173 -ServiceName "Frontend (Vite)"
Stop-ProcessByPort -Port 5000 -ServiceName "API Gateway"
Stop-ProcessByPort -Port 5001 -ServiceName "User Service"
Stop-ProcessByPort -Port 5002 -ServiceName "Book Service"
Stop-ProcessByPort -Port 5003 -ServiceName "Borrow Service"
Stop-ProcessByPort -Port 5004 -ServiceName "Logging Service"

# Stop Consul
Write-Host "`nStopping Consul..." -ForegroundColor Cyan
$consulProcesses = Get-Process -Name "consul" -ErrorAction SilentlyContinue
if ($consulProcesses) {
    $consulProcesses | Stop-Process -Force
    Write-Host "✅ Stopped: Consul" -ForegroundColor Green
} else {
    Write-Host "⚠️  Consul not running" -ForegroundColor Yellow
}

# Stop Node processes (backup)
Write-Host "`nCleaning up Node processes..." -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Stopped all Node.js processes" -ForegroundColor Green
} else {
    Write-Host "⚠️  No Node.js processes running" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Red
Write-Host "✅ SYSTEM STOPPED" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Red

Write-Host "Press any key to close..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
