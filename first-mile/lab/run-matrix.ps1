# FIRST MILE: Windows-only OpenAI benchmark, local credentials, explicit consent.
param([decimal]$BudgetUSD = 1.50)
$ErrorActionPreference = 'Stop'
if ($BudgetUSD -le 0 -or $BudgetUSD -gt 2.58) { throw 'Use budget from $0.01 to $2.58.' }
$base=(Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$script=Join-Path $PSScriptRoot 'matrix.py'
$out=Join-Path $PSScriptRoot 'results.matrix.local.json'
$python=Get-Command python -ErrorAction SilentlyContinue
if (-not $python) { Write-Host 'Python 3.11+ is needed. Add Python to PATH.';return }
Write-Host ''
Write-Host 'FIRST MILE — GPT-6 REASONING MATRIX' -ForegroundColor Green
Write-Host 'Luna: none / low / medium / high'
Write-Host 'Sol: low / medium / high'
Write-Host 'Astra: low / high'
Write-Host ('Initial experiment budget: $'+$BudgetUSD+' USD') -ForegroundColor Yellow
Write-Host 'The software estimate is NOT an OpenAI account-level hard spending limit.'
Write-Host 'Only fictional synthetic pitch documents are used.'
Write-Host ''
$enteredKey=$false
try {
  if (-not $env:OPENAI_API_KEY) {
    $secure=Read-Host 'OpenAI API key (hidden input)' -AsSecureString
    $ptr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { $env:OPENAI_API_KEY=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
    $enteredKey=$true
  }
  if (-not $env:OPENAI_API_KEY) { throw 'No API key was supplied.' }
  Write-Host 'Checking available API models (no generation charges)...'
  & $python.Source (Join-Path $PSScriptRoot 'check_access.py')
  if ($LASTEXITCODE -ne 0) { Write-Host 'Model access check failed. No billable benchmark was started.' -ForegroundColor Yellow;return }
  $confirm=Read-Host 'Type RUN to approve potentially billable OpenAI requests'
  if ($confirm -cne 'RUN') { Write-Host 'Cancelled without API calls.';return }
  Push-Location $base
  try {
    & $python.Source $script --allow-billable --budget-usd $BudgetUSD --output $out
    if ($LASTEXITCODE -ne 0) { throw ('Benchmark exited with '+$LASTEXITCODE) }
  } finally { Pop-Location }
  Write-Host ('Result created: '+$out) -ForegroundColor Green
  Write-Host 'Import it at https://mikelninh.github.io/first-mile/lab/#reasoning-matrix'
} finally {
  if ($enteredKey) { Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue }
}
