$srcDir = 'C:\Users\andre\.gemini\antigravity\scratch\card-game'
$zipPath = 'C:\Users\andre\.gemini\antigravity\scratch\card-game.zip'

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

Get-ChildItem -Path $srcDir -Recurse | Where-Object { -not $_.PSIsContainer } | ForEach-Object {
    $relPath = $_.FullName.Substring($srcDir.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $relPath)
}

$zip.Dispose()
Write-Host "ZIP creato con successo per Netlify (Linux Forward Slashes)!"
