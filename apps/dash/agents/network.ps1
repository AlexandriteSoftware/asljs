# Active network interfaces: those whose adapter is up, with their IPv4 addresses
# and default gateway.
#
# Each item: label is the interface name, such as 'Ethernet'; ip its IPv4 addresses
# and gateway its IPv4 default gateways, each joined with ', ', and '' when it has
# none, as an internal virtual switch has no gateway. Sorted by name, so the same
# setup prints the same value. IPv6 is left out: its temporary addresses rotate on
# their own and would make every run a new sample.

$items = @(
    Get-NetIPConfiguration |
        Where-Object { $_.NetAdapter.Status -eq 'Up' } |
        Sort-Object InterfaceAlias |
        ForEach-Object {
            [pscustomobject][ordered]@{
                label   = $_.InterfaceAlias
                ip      = @($_.IPv4Address.IPAddress) -join ', '
                gateway = @($_.IPv4DefaultGateway.NextHop) -join ', '
            }
        }
)

ConvertTo-Json -InputObject $items -Compress
