@echo off
chcp 65001 >nul
set "PY_CMD=python"
py -3.12 -V >nul 2>nul && set "PY_CMD=py -3.12"
if not defined BUNDLE_WEBVIEW2_FIXED set "BUNDLE_WEBVIEW2_FIXED=0"
if not defined LINGUASYNC_INCLUDE_LOCAL_AI set "LINGUASYNC_INCLUDE_LOCAL_AI=1"
echo ==========================================
echo    LinguaSync Pro 强力打包脚本 (防占用版)
echo ==========================================
echo.

echo [0/4] 正在清理后台残留的幽灵进程...
:: 强制结束可能卡在后台的 LinguaSync Pro 进程，防止 WinError 5 拒绝访问报错
taskkill /f /im "LinguaSyncPro.exe" 2>nul
taskkill /f /im "LinguaSync Pro.exe" 2>nul
:: 给系统 1 秒钟时间释放文件句柄
timeout /t 1 /nobreak >nul

echo.
echo [1/4] 正在清理可能冲突的错误包名称...
%PY_CMD% -m pip uninstall -y webview

echo.
echo [2/4] 正在[当前 Python 环境]中安装正确的 pywebview 和底层依赖...
%PY_CMD% -m pip install pywebview pyinstaller pythonnet pystray pillow

if "%BUNDLE_WEBVIEW2_FIXED%"=="1" (
echo.
echo [2.5/4] 姝ｅ湪鍑嗗 WebView2 Fixed Runtime...
powershell -ExecutionPolicy Bypass -File "%~dp0prepare_webview2_fixed.ps1"
if errorlevel 1 exit /b 1
)

echo.
echo [3/4] 正在清理历史打包缓存...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist

echo.
echo [4/4] 开始执行打包 (强制绑定当前 Python 解析器)...
%PY_CMD% -m PyInstaller --noconfirm LinguaSyncPro.spec

echo.
echo ==========================================
echo 打包流程结束！
echo 请往上滑查看日志，如果没有看到 "PermissionError" 等报错，说明打包成功。
echo 请前往 【dist】 文件夹下查看生成的 exe。
echo ==========================================
pause
