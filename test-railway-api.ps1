# Тест Railway API
$token = "ae83fcae-811e-4d87-ab54-3430b5c9aa3a"
$project = "a6111262-b4c7-468f-97e6-099305db819c"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "Тестирование Railway API..." -ForegroundColor Yellow
Write-Host ""

# Тест 1: Получение информации о проекте
Write-Host "1. Проверка доступа к проекту..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://api.railway.app/v1/projects/$project" -Method GET -Headers $headers
    Write-Host "   ✅ Успешно (Status: $($response.StatusCode))" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Проект: $($data.project.name)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Ошибка: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Ответ: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host ""

# Тест 2: Получение списка сервисов
Write-Host "2. Получение списка сервисов..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://api.railway.app/v1/projects/$project/services" -Method GET -Headers $headers
    Write-Host "   ✅ Успешно (Status: $($response.StatusCode))" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Найдено сервисов: $($data.services.Count)" -ForegroundColor White
    if ($data.services.Count -gt 0) {
        foreach ($service in $data.services) {
            Write-Host "   - $($service.service.name) (ID: $($service.service.id))" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   ❌ Ошибка: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Ответ: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host ""

# Тест 3: Получение всех проектов
Write-Host "3. Получение списка всех проектов..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://api.railway.app/v1/projects" -Method GET -Headers $headers
    Write-Host "   ✅ Успешно (Status: $($response.StatusCode))" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "   Найдено проектов: $($data.projects.Count)" -ForegroundColor White
    foreach ($proj in $data.projects) {
        Write-Host "   - $($proj.name) (ID: $($proj.id))" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}
