param(
  [string]$Emails = "sicpseoul@gmail.com",
  [string]$Branch = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Branch)) {
  $Branch = (git rev-parse --abbrev-ref HEAD).Trim()
}

if ([string]::IsNullOrWhiteSpace($Branch)) {
  Write-Host "[FAIL] Could not detect git branch."
  exit 1
}

if ($Branch -eq "main") {
  Write-Host "[SKIP] Branch is 'main' (production branch). Preview env is branch-scoped on non-production branches."
  exit 0
}

$remoteBranch = git ls-remote --heads origin $Branch
if ([string]::IsNullOrWhiteSpace($remoteBranch)) {
  Write-Host "[FAIL] Remote branch '$Branch' not found on origin."
  Write-Host "Push the branch first: git push -u origin $Branch"
  exit 1
}

$cmd = "vercel env add PLATFORM_ADMIN_EMAILS preview $Branch --value $Emails --yes --force"
Write-Host "[RUN] $cmd"
cmd /c $cmd
