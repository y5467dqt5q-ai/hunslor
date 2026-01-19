# Скрипт для копирования иконок категорий в проект
$sourcePath = "C:\Users\Вітання!\Desktop\мини картинки"
$targetPath = "C:\hunslor\public\category-icons"

# Маппинг названий папок к именам файлов
$categoryMapping = @{
    "smartphone" = "smartphone.png"
    "watch" = "watch.png"
    "console" = "console.png"
    "vr" = "vr.png"
    "headphone" = "headphone.png"
    "dyson" = "dyson.png"
    "camera" = "camera.png"
    "laptop" = "laptop.png"
    "tv" = "tv.png"
}

# Создаем целевую папку, если её нет
if (!(Test-Path $targetPath)) {
    New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
    Write-Host "✅ Created directory: $targetPath"
}

# Проверяем существование исходной папки
if (!(Test-Path $sourcePath)) {
    Write-Host "❌ Source path does not exist: $sourcePath"
    exit 1
}

Write-Host "📁 Source path: $sourcePath"
Write-Host "📁 Target path: $targetPath"
Write-Host ""

# Копируем изображения
$copied = 0
foreach ($folderName in $categoryMapping.Keys) {
    $sourceFolder = Join-Path $sourcePath $folderName
    $targetFileName = $categoryMapping[$folderName]
    
    if (Test-Path $sourceFolder) {
        # Ищем первое изображение в папке
        $imageFiles = Get-ChildItem -Path $sourceFolder -File | Where-Object {
            $_.Extension -match '\.(png|jpg|jpeg|webp|gif|svg)$'
        } | Sort-Object Name | Select-Object -First 1
        
        if ($imageFiles) {
            $sourceFile = $imageFiles.FullName
            $targetFile = Join-Path $targetPath $targetFileName
            
            # Получаем расширение исходного файла
            $extension = [System.IO.Path]::GetExtension($sourceFile)
            
            # Если целевой файл должен быть PNG, но исходный имеет другое расширение,
            # сохраняем с исходным расширением или конвертируем в PNG
            if ($extension -ne ".png" -and $targetFileName -like "*.png") {
                $targetFile = Join-Path $targetPath ($folderName + $extension)
            }
            
            Copy-Item -Path $sourceFile -Destination $targetFile -Force
            Write-Host "✅ Copied: $folderName -> $targetFileName ($([System.IO.Path]::GetFileName($sourceFile)))"
            $copied++
        } else {
            Write-Host "⚠️  No images found in: $sourceFolder"
        }
    } else {
        Write-Host "⚠️  Folder not found: $sourceFolder"
    }
}

Write-Host ""
Write-Host "✅ Done! Copied $copied images to $targetPath"
