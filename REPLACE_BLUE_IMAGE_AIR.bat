@echo off
chcp 65001 >nul
echo ========================================
echo Замена заглавной фотки Blue для iPhone 17 Air
echo ========================================
echo.

echo Инструкция:
echo 1. Сохраните новое изображение на рабочий стол
echo 2. Переименуйте его в: iphone17air-blue-new.jpg
echo 3. Нажмите Enter, чтобы продолжить
echo.

pause

echo.
echo Поиск нового изображения...
echo.

cd /d C:\hunslor
set PATH=C:\node-v24.13.0-win-x64;%PATH%

npx tsx prisma/replace-blue-main-air.ts

echo.
echo Готово! Обновите страницу сайта, чтобы увидеть изменения.
echo.
pause
