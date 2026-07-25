$port = 8888
$ip = "192.168.1.101"

$endpoint = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Any, $port)
$listener = New-Object System.Net.Sockets.TcpListener($endpoint)

try {
    $listener.Start()
    Write-Host "Server WiFi attivo! Collega il telefono a: http://${ip}:${port}/"
} catch {
    Write-Host "Errore avvio Socket: $_"
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

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)

        $requestLine = $reader.ReadLine()
        if ([string]::IsNullOrWhiteSpace($requestLine)) {
            $client.Close()
            continue
        }

        $parts = $requestLine.Split(' ')
        if ($parts.Length -lt 2) {
            $client.Close()
            continue
        }

        $rawUrl = $parts[1]
        $cleanUrl = $rawUrl.Split('?')[0].Split('#')[0]
        if ($cleanUrl -eq "/") { $cleanUrl = "/index.html" }

        $relativeFilePath = [System.Uri]::UnescapeDataString($cleanUrl).TrimStart('/')
        $relativeFilePath = $relativeFilePath.Replace('/', '\')

        $fullPath = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $relativeFilePath))

        if ($fullPath.StartsWith((Get-Location).Path) -and [System.IO.File]::Exists($fullPath)) {
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
            $contentType = "application/octet-stream"
            if ($mimeTypes.ContainsKey($ext)) { $contentType = $mimeTypes[$ext] }

            $bytes = [System.IO.File]::ReadAllBytes($fullPath)

            $header = "HTTP/1.1 200 OK`r`nContent-Type: ${contentType}`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)

            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
        } else {
            $notFound = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nConnection: close`r`n`r`n404 File Not Found"
            $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes($notFound)
            $stream.Write($notFoundBytes, 0, $notFoundBytes.Length)
        }

        $stream.Flush()
        $client.Close()
    } catch {
        # Ignora disconnessioni
    }
}
