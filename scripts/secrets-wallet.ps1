[CmdletBinding()]
param(
  [ValidateSet('Check', 'Plan')]
  [string]$Mode = 'Check',

  [string]$ManifestPath = '',

  [switch]$CheckLocalEnv,

  [switch]$CheckGitHub
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($scriptRoot)) {
  $scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
}
if ([string]::IsNullOrWhiteSpace($ManifestPath)) {
  $ManifestPath = Join-Path $scriptRoot '..\config\secrets.manifest.json'
}

function Get-JsonProperty {
  param(
    [Parameter(Mandatory = $true)]
    [object]$Object,
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [object]$Default = $null
  )

  if ($null -eq $Object) {
    return $Default
  }

  $property = $Object.PSObject.Properties[$Name]
  if ($null -eq $property) {
    return $Default
  }

  return $property.Value
}

function Assert-NoSecretValueFields {
  param(
    [AllowNull()]
    [object]$Node,
    [string]$Path = '$'
  )

  if ($null -eq $Node) {
    return
  }

  if ($Node -is [System.Array]) {
    for ($i = 0; $i -lt $Node.Count; $i++) {
      Assert-NoSecretValueFields -Node $Node[$i] -Path "$Path[$i]"
    }
    return
  }

  if ($Node -is [pscustomobject]) {
    foreach ($property in $Node.PSObject.Properties) {
      if ($property.Name -in @('value', 'secret_value', 'plaintext', 'api_key_value', 'token_value', 'password_value')) {
        throw "Forbidden secret value field '$($property.Name)' at $Path."
      }
      Assert-NoSecretValueFields -Node $property.Value -Path "$Path.$($property.Name)"
    }
  }
}

function Get-GitHubSecretMetadata {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Repo
  )

  $gh = Get-Command gh -ErrorAction SilentlyContinue
  if (-not $gh) {
    throw 'GitHub CLI not found; install gh or run without -CheckGitHub.'
  }

  $json = gh secret list --repo $Repo --json name,updatedAt,visibility 2>$null
  if ($LASTEXITCODE -ne 0) {
    throw "gh secret list failed for $Repo."
  }

  return @($json | ConvertFrom-Json)
}

if (-not (Test-Path -LiteralPath $ManifestPath)) {
  throw "Manifest not found: $ManifestPath"
}

$manifest = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
Assert-NoSecretValueFields -Node $manifest

$entries = @(Get-JsonProperty -Object $manifest -Name 'entries' -Default @())
if ($entries.Count -eq 0) {
  throw 'Manifest has no entries.'
}

$envNameRegex = '^[A-Z][A-Z0-9_]*$'
$seen = @{}
$validationRows = foreach ($entry in $entries) {
  $envName = [string](Get-JsonProperty -Object $entry -Name 'env_name' -Default '')
  $secretClass = [string](Get-JsonProperty -Object $entry -Name 'secret_class' -Default '')
  $provider = [string](Get-JsonProperty -Object $entry -Name 'provider' -Default '')
  $rotation = Get-JsonProperty -Object $entry -Name 'rotation' -Default $null
  $issue = Get-JsonProperty -Object $rotation -Name 'issue' -Default $null

  if ([string]::IsNullOrWhiteSpace($envName)) {
    throw 'Every manifest entry must have env_name.'
  }
  if ($envName -notmatch $envNameRegex) {
    throw "Invalid env_name '$envName'."
  }
  if ($seen.ContainsKey($envName)) {
    throw "Duplicate env_name '$envName'."
  }
  $seen[$envName] = $true

  [pscustomobject]@{
    env_name = $envName
    secret_class = $secretClass
    provider = $provider
    issue = $issue
    local_env_present = if ($CheckLocalEnv) { Test-Path "Env:$envName" } else { $null }
  }
}

$githubRepos = @{}
foreach ($entry in $entries) {
  foreach ($destination in @(Get-JsonProperty -Object $entry -Name 'destinations' -Default @())) {
    if ((Get-JsonProperty -Object $destination -Name 'type' -Default '') -eq 'github_actions') {
      $repo = [string](Get-JsonProperty -Object $destination -Name 'repo' -Default '')
      if (-not [string]::IsNullOrWhiteSpace($repo)) {
        $githubRepos[$repo] = $true
      }
    }
  }
}

$githubRows = @()
if ($CheckGitHub) {
  foreach ($repo in $githubRepos.Keys) {
    $metadata = Get-GitHubSecretMetadata -Repo $repo
    foreach ($entry in $entries) {
      foreach ($destination in @(Get-JsonProperty -Object $entry -Name 'destinations' -Default @())) {
        if ((Get-JsonProperty -Object $destination -Name 'type' -Default '') -ne 'github_actions') {
          continue
        }
        if ((Get-JsonProperty -Object $destination -Name 'repo' -Default '') -ne $repo) {
          continue
        }

        $secretName = [string](Get-JsonProperty -Object $destination -Name 'secret_name' -Default '')
        $match = $metadata | Where-Object { $_.name -eq $secretName } | Select-Object -First 1
        $githubRows += [pscustomobject]@{
          repo = $repo
          secret_name = $secretName
          present = $null -ne $match
          updated_at = if ($match) { $match.updatedAt } else { $null }
          visibility = if ($match) { $match.visibility } else { $null }
        }
      }
    }
  }
}

if ($Mode -eq 'Plan') {
  $planRows = foreach ($entry in $entries) {
    $rotation = Get-JsonProperty -Object $entry -Name 'rotation' -Default $null
    [pscustomobject]@{
      env_name = Get-JsonProperty -Object $entry -Name 'env_name' -Default ''
      issue = Get-JsonProperty -Object $rotation -Name 'issue' -Default $null
      cadence = Get-JsonProperty -Object $rotation -Name 'cadence' -Default ''
      requires_provider_revocation = Get-JsonProperty -Object $rotation -Name 'requires_provider_revocation' -Default $false
      revocation_auth_env_name = Get-JsonProperty -Object $rotation -Name 'revocation_auth_env_name' -Default $null
    }
  }
  $planRows | ConvertTo-Json -Depth 8
  exit 0
}

[pscustomobject]@{
  manifest = (Resolve-Path -LiteralPath $ManifestPath).Path
  schema_version = Get-JsonProperty -Object $manifest -Name 'schema_version' -Default ''
  claim_impact = Get-JsonProperty -Object $manifest -Name 'claim_impact' -Default 'no_claim_promotion'
  local_env = $validationRows
  github_actions = $githubRows
} | ConvertTo-Json -Depth 10
