# Busiest processes by total CPU seconds.
Get-Process |
    Where-Object { $_.CPU -gt 0 } |
    Sort-Object CPU -Descending |
    Select-Object -First 8 |
    ForEach-Object {
        [pscustomobject]@{
            label = $_.ProcessName
            # Rounded to whole seconds so a quiet process stays one sticky sample.
            cpu   = "$([math]::Round($_.CPU, 0))s"
        }
    } |
    ConvertTo-Json -Compress -AsArray
