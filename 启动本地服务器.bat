@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 一份知识，两种表达（模块化版本）- 本地服务器

echo.
echo   ================================================================
echo     《一份知识，两种表达》模块化版本 · 本地服务器
echo   ================================================================
echo.
echo   本机访问：   http://127.0.0.1:8125/ai-science-learning/index.html
echo.
echo   手机访问（手机需与电脑在同一个 Wi-Fi 或热点下）：
powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | ForEach-Object { '     http://' + $_.IPAddress + ':8125/ai-science-learning/index.html   （' + $_.InterfaceAlias + '）' }"
echo.
echo   说明：
echo     1) 直接双击 index.html 也可以离线运行，本服务器只是为了手机预览；
echo     2) 关闭本窗口即停止服务。
echo.
echo   正在启动服务，请不要关闭本窗口...
echo.
cd ..
python -m http.server 8125 --bind 0.0.0.0
pause
