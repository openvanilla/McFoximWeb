@echo off
REM ============================================================================
REM Script Name: [Script Name]
REM Description: This batch script performs automated tasks including:
REM              - Disabling echo to keep output clean
REM              - Setting up the environment for subsequent commands
REM              - Preparing for execution of batch operations
REM
REM Notes: 
REM - Requires Windows command prompt or compatible shell
REM - Must be run with appropriate permissions for intended operations
REM - Echo is disabled for cleaner output display
REM ============================================================================

echo * Build McFoxIM for PIME
call npm run build:pime
echo * Delete old files
rmdir /S /Q "C:\Program Files (x86)\PIME\node\input_methods\mcfoxim"
echo * Copy new files
xcopy /E /I ".\output\pime" "C:\Program Files (x86)\PIME\node\input_methods\mcfoxim"

echo "Please restart PIME Launcher to see the changes."

