$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "[INFO] Running repository safety check"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/check-repo-safety.ps1

Write-Host "[INFO] Running web lint"
corepack pnpm --filter web lint

Write-Host "[INFO] Running web build"
corepack pnpm --filter web build

Write-Host "[INFO] Running participant smoke e2e"
corepack pnpm --filter web e2e:smoke

Write-Host "[INFO] Running admin free-core e2e"
corepack pnpm --filter web e2e:admin-core

Write-Host "[INFO] Running OAuth contract e2e"
corepack pnpm --filter web e2e -- e2e/oauth-contract.spec.ts

Write-Host "[PASS] Local verification passed."
