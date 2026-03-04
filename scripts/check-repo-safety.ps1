$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$tracked = git ls-files
if (-not $tracked) {
  Write-Host "No tracked files to check."
  exit 0
}

$forbiddenPatterns = @(
  '(^|/)archive/(?!\.gitkeep$).*',
  '\.sql$',
  '\.sqlite$',
  '\.db$',
  '\.mdb$',
  '\.accdb$',
  '\.csv$',
  '\.xlsx$',
  '\.xls$',
  'myside_save',
  'request_member',
  'survey_backup',
  '\.env$',
  '\.env\..+'
)

$violations = @()
foreach ($f in $tracked) {
  foreach ($p in $forbiddenPatterns) {
    if ($f -match $p) {
      $violations += "$f  (matched: $p)"
      break
    }
  }
}

if ($violations.Count -gt 0) {
  Write-Host "[FAIL] Sensitive or forbidden tracked files detected:" -ForegroundColor Red
  $violations | ForEach-Object { Write-Host " - $_" }
  exit 1
}

Write-Host "[PASS] Repository safety check passed." -ForegroundColor Green
