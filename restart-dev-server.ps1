# Скрипт для перезапуска dev server
$ErrorActionPreference = "Stop"

Write-Host "🔄 Перезапуск dev server..." -ForegroundColor Cyan

# Ищем процессы Node.js, которые могут быть dev server
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*node*" -and $_.MainWindowTitle -eq ""
}

Write-Host "📋 Найдено процессов Node.js: $($nodeProcesses.Count)"

# Останавливаем процессы (аккуратно)
if ($nodeProcesses.Count -gt 0) {
    Write-Host "⏹️  Остановка старых процессов..."
    foreach ($proc in $nodeProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            Write-Host "   ✅ Остановлен процесс $($proc.Id)"
        } catch {
            # Игнорируем ошибки
        }
    }
    Start-Sleep -Seconds 2
}

Write-Host "✅ Процессы остановлены"
Write-Host "🚀 Запуск dev server..." -ForegroundColor Green

# Меняем директорию
Set-Location "C:\hunslor"

# Устанавливаем PATH
$env:Path = "C:\node-v24.13.0-win-x64;$env:Path"

# Запускаем dev server в фоне
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "C:\hunslor" -WindowStyle Minimized

Write-Host "✅ Dev server запущен!" -ForegroundColor Green
Write-Host "💡 Подождите 10-15 секунд, пока сервер запустится"
Write-Host "🌐 Откройте http://localhost:3000 в браузере"
