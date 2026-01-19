# Скрипт для копирования папки с изображениями
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Копирование папки с изображениями" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$source = "$env:USERPROFILE\Desktop\pictr"
$dest = "C:\hunslor\images"

if (-not (Test-Path $source)) {
    Write-Host "ОШИБКА: Папка не найдена: $source" -ForegroundColor Red
    Write-Host ""
    Write-Host "Пожалуйста, укажите правильный путь к папке pictr" -ForegroundColor Yellow
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

Write-Host "Копирую из: $source" -ForegroundColor Cyan
Write-Host "Копирую в:  $dest" -ForegroundColor Cyan
Write-Host ""

try {
    if (Test-Path $dest) {
        Remove-Item $dest -Recurse -Force
    }
    
    Copy-Item -Path $source -Destination $dest -Recurse -Force
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Копирование завершено успешно!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Папка скопирована в: $dest" -ForegroundColor Green
    Write-Host "Теперь изображения будут работать автоматически." -ForegroundColor Green
    
    $count = (Get-ChildItem $dest -Directory).Count
    Write-Host "Найдено папок с товарами: $count" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ОШИБКА при копировании" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Read-Host "Нажмите Enter для выхода"
