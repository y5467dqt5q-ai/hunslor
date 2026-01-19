@echo off
chcp 65001 >nul
echo ========================================
echo   Копирование папки с изображениями
echo ========================================
echo.

set SOURCE=C:\Users\Вітання!\Desktop\pictr
set DEST=C:\hunslor\images

if not exist "%SOURCE%" (
    echo ОШИБКА: Папка не найдена: %SOURCE%
    echo.
    echo Пожалуйста, укажите правильный путь к папке pictr
    pause
    exit /b 1
)

echo Копирую из: %SOURCE%
echo Копирую в:  %DEST%
echo.

robocopy "%SOURCE%" "%DEST%" /E /R:3 /W:1 /NP /NDL /NFL

if %ERRORLEVEL% LEQ 1 (
    echo.
    echo ========================================
    echo   Копирование завершено успешно!
    echo ========================================
    echo.
    echo Папка скопирована в: %DEST%
    echo Теперь изображения будут работать автоматически.
) else (
    echo.
    echo ========================================
    echo   ОШИБКА при копировании
    echo ========================================
)

echo.
pause
