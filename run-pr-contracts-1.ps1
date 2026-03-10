# PR-CONTRACTS-1 — Build, Test & Push
# Run this from: C:\Users\claus\Projetcs\widgetdc-contracts
# Double-click or run in PowerShell

Set-Location "C:\Users\claus\Projetcs\widgetdc-contracts"

Write-Host "=== PR-CONTRACTS-1: orchestrator module ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build
Write-Host "[1/4] Building TypeScript..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "BUILD FAILED" -ForegroundColor Red; Read-Host "Press Enter to exit"; exit 1 }
Write-Host "Build OK" -ForegroundColor Green

# Step 2: Generate schemas
Write-Host ""
Write-Host "[2/4] Generating JSON schemas..." -ForegroundColor Yellow
npm run schemas
if ($LASTEXITCODE -ne 0) { Write-Host "SCHEMA GEN FAILED" -ForegroundColor Red; Read-Host "Press Enter to exit"; exit 1 }
Write-Host "Schemas OK" -ForegroundColor Green

# Step 3: Run tests
Write-Host ""
Write-Host "[3/4] Running tests..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) { Write-Host "TESTS FAILED" -ForegroundColor Red; Read-Host "Press Enter to exit"; exit 1 }
Write-Host "Tests OK" -ForegroundColor Green

# Step 4: Commit & push
Write-Host ""
Write-Host "[4/4] Committing and pushing..." -ForegroundColor Yellow

git add src/orchestrator/ tests/orchestrator.test.ts src/index.ts package.json scripts/export-schemas.ts README.md schemas/

git commit -m "feat(orchestrator): add orchestrator module v0.3.0

- OrchestratorToolCall: Agent->Orchestrator MCP tool request
- OrchestratorToolResult: Orchestrator->Agent result with error codes
- AgentMessage: shared chat format matching Notion Global Chat schema  
- AgentHandshake: agent registration + capability ACL declaration
- AgentId, AgentCapability, AgentHandshakeStatus enums
- 20 vitest tests covering all types and edge cases
- Subpath export: @widgetdc/contracts/orchestrator
- Schema export pipeline updated
- Bumped to v0.3.0"

git push origin main

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Green
Write-Host "PR-CONTRACTS-1 pushed to GitHub." -ForegroundColor Green
Write-Host "Next: Build the Orchestrator server." -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to close"
