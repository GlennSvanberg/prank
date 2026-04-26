# package-client.ps1
# Script to bundle the victim-client for download

$ErrorActionPreference = "Stop"

$rootDir = Get-Item "."
$publicDir = Join-Path $rootDir.FullName "public"
$distDir = Join-Path $rootDir.FullName "dist-client"
$zipFile = Join-Path $publicDir "prank-client.zip"

echo "Building victim client for distribution..."

# 1. Clean up (except node_modules which might be locked)
if (Test-Path $distDir) { 
    Get-ChildItem -Path $distDir -Exclude "node_modules" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue 
}
if (Test-Path $zipFile) { Remove-Item $zipFile }
if (-not (Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir }

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

# 3. Transpile TypeScript to JavaScript (if needed) or just copy and assume ts-node/tsx?
# To make it truly portable without devDeps, we should compile it.
echo "Compiling victim-client..."
cd victim-client
npm install
# We'll use tsc to compile index.ts to index.js
npx tsc --module ESNext --target ESNext --moduleResolution node --skipLibCheck index.ts --outDir ../dist-client
cd ..

# 4. Copy Assets
echo "Copying assets..."
Copy-Item -Path "fart_sounds" -Destination (Join-Path $distDir "fart_sounds") -Recurse
Copy-Item -Path "victim-client/package.json" -Destination $distDir
Copy-Item -Path "victim-client/package-lock.json" -Destination $distDir

# 5. Create run.bat with injected URL
$batContent = Get-Content "victim-client/run.bat"
$batContent = $batContent -replace "REPLACE_WITH_CONVEX_URL", $convexUrl
$batContent | Set-Content (Join-Path $distDir "run.bat")

# 6. Install production dependencies in dist folder
echo "Installing production dependencies in dist folder..."
cd $distDir
npm install --production
cd ..

# 7. Zip it up
echo "Zipping..."
Compress-Archive -Path "$distDir\*" -DestinationPath $zipFile

echo "Done! Client available at public/prank-client.zip"
