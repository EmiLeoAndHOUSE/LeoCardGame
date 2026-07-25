$port = 5000
$listener = New-Object System.Net.HttpListener

try {
    $listener.Prefixes.Add("http://localhost:${port}/")
    $listener.Prefixes.Add("http://127.0.0.1:${port}/")
    $listener.Start()
    Write-Host "Server pulito attivo su http://localhost:${port}/"
} catch {
    Write-Host "Errore avvio server su porta ${port}: $_"
    exit 1
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png"  = "image/png"
    ".json" = "application/json"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }

        $safePath = [System.Uri]::UnescapeDataString($urlPath).TrimStart('/')
        $localPath = Join-Path (Get-Location) $safePath

        if (Test-Path -LiteralPath $localPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            if ($mimeTypes.ContainsKey($ext)) {
                $response.ContentType = $mimeTypes[$ext]
            } else {
                $response.ContentType = "application/octet-stream"
            }

            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found")
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }

        $response.Close()
    }
} finally {
    $listener.Stop()
}
