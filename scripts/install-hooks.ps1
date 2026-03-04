$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path ".githooks")) {
  New-Item -ItemType Directory -Path ".githooks" | Out-Null
}

$preCommit = @"
#!/usr/bin/env pwsh
pwsh -NoProfile -File ./scripts/check-repo-safety.ps1
"@
Set-Content .githooks\pre-commit $preCommit -Encoding UTF8

git config core.hooksPath .githooks
Write-Host "Git hooks path set to .githooks"
Write-Host "Pre-commit hook installed"
