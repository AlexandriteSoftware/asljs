# Free space on C:, as a percentage and in GB.
$drive = Get-PSDrive -Name C
$total = $drive.Used + $drive.Free

[pscustomobject]@{
    freePercent = [math]::Round(($drive.Free / $total) * 100, 1)
    freeGb      = [math]::Round($drive.Free / 1GB, 1)
    totalGb     = [math]::Round($total / 1GB, 1)
} | ConvertTo-Json -Compress
