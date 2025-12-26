@echo off
echo Starting local development server...
echo.
echo The server will be available at: http://localhost:8080
echo Press Ctrl+C to stop the server
echo.

REM Check if Node.js is available
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js not found. Trying Python...
    python -m http.server 8080
    exit /b
)

REM Check if http-server is installed locally
if exist "node_modules\.bin\http-server.cmd" (
    call node_modules\.bin\http-server.cmd -p 8080 -c-1 --cors
) else (
    echo Installing http-server...
    call npm install
    call node_modules\.bin\http-server.cmd -p 8080 -c-1 --cors
)

