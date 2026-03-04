$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path ".githooks")) {
  New-Item -ItemType Directory -Path ".githooks" | Out-Null
}

$preCommit = @'
#!/bin/sh
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/check-repo-safety.ps1
status=$?

if [ "$status" -ne 0 ]; then
  echo "pre-commit blocked: repository safety check failed."
  exit "$status"
fi
'@
Set-Content .githooks\pre-commit $preCommit -Encoding ascii

$prePush = @'
#!/bin/sh
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/verify-local.ps1
status=$?

if [ "$status" -ne 0 ]; then
  echo "pre-push blocked: local verification failed."
  exit "$status"
fi
'@
Set-Content .githooks\pre-push $prePush -Encoding ascii

git config core.hooksPath .githooks
Write-Host "Git hooks path set to .githooks"
Write-Host "Pre-commit and pre-push hooks installed"
