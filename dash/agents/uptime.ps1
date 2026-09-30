# Time since last boot.
$boot = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
$span = (Get-Date) - $boot

[pscustomobject]@{
    days      = [math]::Round($span.TotalDays, 1)
    bootedAt  = $boot.ToString('s')
} | ConvertTo-Json -Compress
