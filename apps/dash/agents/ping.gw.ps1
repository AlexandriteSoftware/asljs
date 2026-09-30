# Round-trip time to the default gateway.
$gateway = (Get-NetRoute -DestinationPrefix '0.0.0.0/0' |
    Sort-Object RouteMetric |
    Select-Object -First 1).NextHop

if (-not $gateway) {
    Write-Error 'no default gateway'
    exit 1
}

$reply = Test-Connection -TargetName $gateway -Count 1 -ErrorAction SilentlyContinue

# Latency is bucketed: a sticky store should not record every millisecond of jitter.
if ($null -eq $reply -or $reply.Status -ne 'Success') {
    $result = [ordered]@{ status = 'error'; message = "no reply from $gateway" }
} else {
    $ms = [math]::Round($reply.Latency / 5) * 5
    $result = [ordered]@{
        status  = if ($ms -gt 100) { 'warn' } else { 'ok' }
        ms      = $ms
        message = "$gateway  ${ms} ms"
    }
}

[pscustomobject]$result | ConvertTo-Json -Compress
