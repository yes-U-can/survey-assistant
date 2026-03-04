$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "[INFO] Running repository safety check"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/check-repo-safety.ps1

Write-Host "[INFO] Running web lint"
corepack pnpm --filter web lint

Write-Host "[INFO] Running web build"
corepack pnpm --filter web build

Write-Host "[PASS] Local verification passed."
