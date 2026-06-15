$ffmpeg = "C:\Users\jammu\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe"
$exclude = @("scroll1.mp4", "scroll2.mp4", "scroll3.mp4", "scroll6.mp4", "scroll8.mp4", "scroll9.mp4", "scroll13.mp4")
$folder = "d:\Abhiram portifolio"

$files = Get-ChildItem -Path $folder -Filter "*.mp4" -File
foreach ($f in $files) {
    if ($exclude -contains $f.Name) {
        Write-Host "Skipping $($f.Name)"
        continue
    }
    Write-Host "Compressing $($f.Name)..."
    $tmp = "$($f.FullName).tmp.mp4"
    & $ffmpeg -y -i $f.FullName -vcodec libx264 -crf 28 -preset fast -loglevel error $tmp
    if ($LASTEXITCODE -eq 0) {
        Move-Item -Path $tmp -Destination $f.FullName -Force
        Write-Host "Replaced $($f.Name)"
    } else {
        Write-Host "Failed to compress $($f.Name)"
    }
}
Write-Host "Compression Script Completed Successfully!"
