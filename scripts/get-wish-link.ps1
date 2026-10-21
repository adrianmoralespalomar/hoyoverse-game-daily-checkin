# Saca el enlace del historial de tiradas de Genshin, Star Rail o ZZZ de la caché del juego y lo copia al portapapeles.
# Antes: abre el juego en este PC y entra en el historial de tiradas (Gachapón → Historial).
# Uso: powershell -ExecutionPolicy Bypass -File scripts\get-wish-link.ps1 -Game gi   (gi, hsr o zzz)
# Solo lee ficheros del juego: no se conecta a nada ni cambia nada.
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('gi', 'hsr', 'zzz')]
  [string]$Game
)

$ErrorActionPreference = 'Stop'
$localLow = Join-Path $env:USERPROFILE 'AppData\LocalLow'
# Log del juego y cómo aparece en él la carpeta de datos (`*_Data`)
$games = @{
  gi  = @{ Log = 'miHoYo\Genshin Impact\output_log.txt'; DataPattern = '([A-Z]:/[^\r\n]*?/(GenshinImpact_Data|YuanShen_Data))' }
  hsr = @{ Log = 'Cognosphere\Star Rail\Player.log'; DataPattern = '([A-Z]:/[^\r\n]*?/StarRail_Data)' }
  zzz = @{ Log = 'miHoYo\ZenlessZoneZero\Player.log'; DataPattern = '([A-Z]:/[^\r\n]*?/ZenlessZoneZero_Data)' }
}

$logPath = Join-Path $localLow $games[$Game].Log
if (-not (Test-Path $logPath)) { throw "No encuentro el log del juego ($logPath). ¿Lo has abierto en este PC?" }
$dataMatch = [regex]::Match((Get-Content $logPath -Raw), $games[$Game].DataPattern)
if (-not $dataMatch.Success) { throw 'El log no dice dónde está instalado el juego. Abre el juego y vuelve a probar.' }

$webCaches = Join-Path $dataMatch.Groups[1].Value 'webCaches'
$latestCache = Get-ChildItem $webCaches -Directory | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $latestCache) { throw "No hay caché web en $webCaches. Abre el historial de tiradas en el juego." }

# El juego tiene el fichero abierto: se lee una copia
$cachePath = Join-Path $latestCache.FullName 'Cache\Cache_Data\data_2'
$copyPath = Join-Path $env:TEMP 'hoyo-games-data_2'
Copy-Item $cachePath $copyPath -Force
$cacheText = [System.Text.Encoding]::UTF8.GetString([System.IO.File]::ReadAllBytes($copyPath))
Remove-Item $copyPath

$links = [regex]::Matches($cacheText, 'https://[^\s\x00"]+?authkey=[^\s\x00"]+') | Where-Object { $_.Value -match 'gacha' }
if (-not $links) { throw 'No hay ningún enlace del historial en la caché. Abre el historial de tiradas en el juego y vuelve a probar.' }

$links[-1].Value | Set-Clipboard
Write-Host 'Enlace copiado al portapapeles. Pégalo en Hoyo Games (sección Tiradas). Dura 24 horas.'
