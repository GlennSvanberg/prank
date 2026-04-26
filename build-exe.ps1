# build-exe.ps1
# Script to build a standalone EXE for the prank client

$ErrorActionPreference = "Stop"

$rootDir = Get-Item "."
$publicDir = Join-Path $rootDir.FullName "public"
$clientDir = Join-Path $rootDir.FullName "victim-client"
$tempBuildDir = Join-Path $rootDir.FullName "temp-build"

echo "Building standalone EXE..."

# 1. Clean up
if (Test-Path $tempBuildDir) { Remove-Item -Recurse -Force $tempBuildDir }
New-Item -ItemType Directory -Path $tempBuildDir

# 2. Get Convex URL from .env.local
$envFile = Join-Path $rootDir.FullName ".env.local"
$convexUrl = ""
if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    if ($content -match "VITE_CONVEX_URL=(.+)") {
        $convexUrl = $Matches[1].Trim()
    }
}

if (-not $convexUrl) {
    Write-Error "Could not find VITE_CONVEX_URL in .env.local"
}

echo "Using Convex URL: $convexUrl"

# 3. Get Sounds as Base64
echo "Embedding sounds..."
$sounds = @{}
$soundsDir = Join-Path $rootDir.FullName "fart_sounds"
if (Test-Path $soundsDir) {
    Get-ChildItem -Path $soundsDir -Filter "*.mp3" | ForEach-Object {
        $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
        $b64 = [System.Convert]::ToBase64String($bytes)
        $sounds[$_.Name] = $b64
        echo "  Embedded: $($_.Name)"
    }
}
$soundsJson = $sounds | ConvertTo-Json -Compress

# 4. Create injected index.ts
$indexPath = Join-Path $clientDir "index.ts"
$indexContent = Get-Content $indexPath -Raw
$indexContent = $indexContent -replace "REPLACE_WITH_CONVEX_URL", $convexUrl
# String replacement for the embedded sounds object
$indexContent = $indexContent -replace "embeddedSounds: \{\} as Record<string, string>", "embeddedSounds: $soundsJson"

$tempIndex = Join-Path $tempBuildDir "index.ts"
$indexContent | Set-Content $tempIndex

# 5. Bundle with esbuild
echo "Bundling with esbuild..."
# We need to be in the client dir to resolve dependencies
cd $clientDir
npx esbuild $tempIndex --bundle --platform=node --target=node18 --outfile="$tempBuildDir\bundle.cjs" --format=cjs --minify

# 6. Run pkg
echo "Packaging with pkg..."
# We use node18 to ensure compatibility with modern features
npx pkg "$tempBuildDir\bundle.cjs" --targets node18-win-x64 --output "$publicDir\prank.exe"

# 7. Cleanup
cd $rootDir
Remove-Item -Recurse -Force $tempBuildDir

echo "------------------------------------------------"
echo "Success! Standalone EXE is at public/prank.exe"
echo "------------------------------------------------"
