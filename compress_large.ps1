$ffmpeg = "C:\Users\jammu\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe"
$folder = "D:\Abhiram portifolio"

$files = Get-ChildItem -Path $folder -Filter "*.mp4" -File | Where-Object { $_.Length -gt 10MB }
foreach ($f in $files) {
    Write-Host "Compressing $($f.Name) (Size: $([math]::round($f.Length/1MB,2))MB)..."
    $tmp = "$($f.FullName).tmp.mp4"
    & $ffmpeg -y -i $f.FullName -vcodec libx264 -crf 33 -preset slow -loglevel error $tmp
    if ($LASTEXITCODE -eq 0) {
        Move-Item -Path $tmp -Destination $f.FullName -Force
        Write-Host "Replaced $($f.Name) successfully!"
    } else {
        Write-Host "Failed to compress $($f.Name)"
    }
}
Write-Host "Heavy Compression Completed!"
