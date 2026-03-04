param(
  [string]$BaseUrl = "https://surveysicp.vercel.app"
)

$ErrorActionPreference = "Stop"

function Invoke-CheckedRequest {
  param(
    [string]$Url,
    [int]$ExpectedStatus
  )

  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -Method GET
    if ($response.StatusCode -ne $ExpectedStatus) {
      throw "Expected status $ExpectedStatus but got $($response.StatusCode) for $Url"
    }
    return $response
  } catch [System.Net.WebException] {
    if (-not $_.Exception.Response) {
      throw
    }
    $statusCode = [int]$_.Exception.Response.StatusCode
    if ($statusCode -ne $ExpectedStatus) {
      throw "Expected status $ExpectedStatus but got $statusCode for $Url"
    }
    return $null
  }
}

Write-Host "[INFO] Running smoke checks against $BaseUrl"

$health = Invoke-CheckedRequest -Url "$BaseUrl/api/health/db" -ExpectedStatus 200
$healthBody = $health.Content | ConvertFrom-Json
if (-not $healthBody.ok) {
  throw "Health check response does not contain ok=true."
}

Invoke-CheckedRequest -Url "$BaseUrl/api/admin/special-requests" -ExpectedStatus 401 | Out-Null
Invoke-CheckedRequest -Url "$BaseUrl/api/admin/store/purchases" -ExpectedStatus 401 | Out-Null
Invoke-CheckedRequest -Url "$BaseUrl/api/platform-admin/overview" -ExpectedStatus 401 | Out-Null
Invoke-CheckedRequest -Url "$BaseUrl/api/participant/packages" -ExpectedStatus 401 | Out-Null

Write-Host "[PASS] Smoke checks passed."
