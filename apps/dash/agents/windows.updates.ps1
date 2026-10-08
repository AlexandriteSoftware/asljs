# Windows updates that are available and not installed yet, as Windows Update would
# offer them: drivers included, hidden updates left out.
#
# Each item: label is the update's title, kb its KB article ids such as 'KB5034441',
# '' for updates without one, such as most drivers. Sorted by title, so the same set
# of updates prints the same value. An empty array means nothing is pending.
#
# The search asks the Windows Update service and can take tens of seconds. It fails,
# and the runner records no sample, when the service cannot be reached.

$session = New-Object -ComObject Microsoft.Update.Session
$searcher = $session.CreateUpdateSearcher()
$results = $searcher.Search('IsInstalled=0 and IsHidden=0')

$items = @(
    $results.Updates |
        Sort-Object Title |
        ForEach-Object {
            [pscustomobject][ordered]@{
                label = $_.Title
                kb    = (@($_.KBArticleIDs) | ForEach-Object { "KB$_" }) -join ', '
            }
        }
)

ConvertTo-Json -InputObject $items -Compress
