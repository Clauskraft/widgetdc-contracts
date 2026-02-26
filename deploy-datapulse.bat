@echo off
cd /d C:\Users\claus\Projects\widgetdc-contracts
echo === DataPulse v1.0 Deploy ===
echo.
echo [1/3] Staging all changes...
git add -A
echo.
echo [2/3] Committing...
git commit -m "feat: DataPulse v1.0 — Master Data Intelligence dashboard, analysis engine, lineage graph, 7 MCP tools"
echo.
echo [3/3] Pushing to main...
git push origin main
echo.
echo === Done! Railway auto-deploys from main ===
echo DataPulse: https://arch-mcp-server-production.up.railway.app/data
echo Lineage:   https://arch-mcp-server-production.up.railway.app/data/lineage
echo.
pause
