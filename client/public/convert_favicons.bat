@echo off
echo Converting favicon files...

REM Check if ImageMagick is installed
where magick >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo ImageMagick not found. Please install it or convert the SVG files manually.
  echo SVG files are in the client/public directory.
  exit /b 1
)

REM Convert flight-icon-192.svg to logo192.png
magick convert flight-icon-192.svg logo192.png

REM Convert flight-icon-512.svg to logo512.png
magick convert flight-icon-512.svg logo512.png

REM Create favicon.ico with multiple sizes
magick convert flight-icon-192.svg -define icon:auto-resize=16,32,48,64,128 favicon.ico

echo Conversion complete!
echo If you don't see any errors, the favicon files have been updated.
echo You may delete the SVG files and this script if desired. 