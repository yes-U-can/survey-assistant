$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Invoke-Step {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Label,
    [Parameter(Mandatory = $true)]
    [scriptblock]$Action
  )

  Write-Host "[INFO] $Label"
  & $Action
  if ($LASTEXITCODE -ne 0) {
    throw "Step failed: $Label (exit code $LASTEXITCODE)"
  }
}

Invoke-Step "Running repository safety check" {
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/check-repo-safety.ps1
}

Invoke-Step "Running web lint" {
  corepack pnpm --filter web lint
}

Invoke-Step "Running web build" {
  corepack pnpm --filter web build
}

Invoke-Step "Running participant smoke e2e" {
  corepack pnpm --filter web e2e:smoke
}

Invoke-Step "Running admin free-core e2e" {
  corepack pnpm --filter web e2e:admin-core
}

Invoke-Step "Running OAuth contract e2e" {
  corepack pnpm --filter web e2e -- e2e/oauth-contract.spec.ts
}

Write-Host "[PASS] Local verification passed."
