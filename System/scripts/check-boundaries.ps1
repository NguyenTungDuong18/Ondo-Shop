$ErrorActionPreference = 'Stop'
$backendRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$sourceRoot = [IO.Path]::GetFullPath((Join-Path $backendRoot 'src'))
function Assert-BackendSource([string]$path) {
    $resolved = [IO.Path]::GetFullPath($path)
    if (-not $resolved.StartsWith($sourceRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Backend reference escapes BE/src: $resolved"
    }
    if (-not (Test-Path -LiteralPath $resolved)) { throw "Missing backend source: $resolved" }
}
[xml]$solution = Get-Content -LiteralPath (Join-Path $backendRoot 'MySystem.slnx') -Raw
foreach ($project in $solution.Solution.Project) {
    $projectPath = Join-Path $backendRoot $project.Path
    Assert-BackendSource $projectPath
    [xml]$projectXml = Get-Content -LiteralPath $projectPath -Raw
    foreach ($reference in $projectXml.SelectNodes('//ProjectReference')) {
        Assert-BackendSource (Join-Path (Split-Path -Parent $projectPath) $reference.Include)
    }
    foreach ($include in $projectXml.SelectNodes('//Compile[@Include] | //Content[@Include] | //None[@Include]')) {
        if ($include.Include -match '(?i)frontend|\.tsx?$|\.jsx?$') { throw "Frontend source included by $projectPath" }
    }
}
$frontendFiles = Get-ChildItem -LiteralPath $sourceRoot -Recurse -File | Where-Object {
    $_.FullName -notmatch '\\(bin|obj)\\' -and ($_.Extension -in '.ts','.tsx','.jsx' -or $_.Name -eq 'package.json')
}
if ($frontendFiles) { throw "FE files found inside BE/src: $($frontendFiles.FullName -join ', ')" }
Write-Output 'BE source boundaries passed: solution and project references stay within System/src.'
