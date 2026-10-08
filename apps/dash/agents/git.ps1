# Working folder status of a git repository: branch, commit, whether it is pushed,
# whether it is dirty, and how it differs from its remote.
#
#   pwsh -NoProfile -File agents/git.ps1 -Path C:\Projects\asljs
#
# Without -Path the current directory is used, which is the directory of the config
# that declares the counter. Exits non-zero when the path is not a repository, so the
# runner records no sample.

param([string]$Path = '.')

$lines = git -C $Path status --porcelain=v2 --branch 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Error "git status failed in ${Path}: $lines"
    exit 1
}

$branch = '(unknown)'
$oid = ''
$upstream = ''
$ahead = 0
$behind = 0
$staged = 0
$changed = 0
$untracked = 0
$conflicted = 0

foreach ($line in $lines) {
    switch -Regex ($line) {
        '^# branch\.oid (.+)$' { $oid = $Matches[1]; continue }
        '^# branch\.head (.+)$' { $branch = $Matches[1]; continue }
        '^# branch\.upstream (.+)$' { $upstream = $Matches[1]; continue }
        '^# branch\.ab \+(\d+) -(\d+)$' {
            $ahead = [int]$Matches[1]
            $behind = [int]$Matches[2]
            continue
        }
        # Ordinary and renamed entries carry two status letters: staged, then worktree.
        '^[12] (.)(.) ' {
            if ($Matches[1] -ne '.') { $staged++ }
            if ($Matches[2] -ne '.') { $changed++ }
            continue
        }
        '^u ' { $conflicted++; continue }
        '^\? ' { $untracked++; continue }
    }
}

$commit = if ($oid -eq '(initial)') { '' } else { $oid.Substring(0, 7) }
$dirty = ($staged + $changed + $untracked + $conflicted) -gt 0
$pushed = ($upstream -ne '') -and ($ahead -eq 0)

$status =
    if ($conflicted -gt 0) { 'error' }
    elseif ($dirty -or -not $pushed -or $behind -gt 0) { 'warn' }
    else { 'ok' }

# The message is the one-line summary a narrow card shows.
$notes = @()
if ($staged -gt 0) { $notes += "$staged staged" }
if ($changed -gt 0) { $notes += "$changed changed" }
if ($untracked -gt 0) { $notes += "$untracked untracked" }
if ($conflicted -gt 0) { $notes += "$conflicted conflicted" }
if ($ahead -gt 0) { $notes += "ahead $ahead" }
if ($behind -gt 0) { $notes += "behind $behind" }
if ($upstream -eq '') { $notes += 'no upstream' }
if ($notes.Count -eq 0) { $notes += 'clean' }

# The fields of the printed object:
#
#   status      'error' when something is conflicted; 'warn' when the folder is
#               dirty, behind, or not pushed; 'ok' otherwise.
#   branch      The checked-out branch, '(detached)' when HEAD is detached.
#   commit      The first 7 characters of the HEAD commit id, '' before the first
#               commit.
#   upstream    The branch it tracks, such as 'origin/main', '' when it tracks none.
#   ahead       Commits on the branch that the upstream does not have, that is,
#               commits to push. 0 without an upstream.
#   behind      Commits on the upstream that the branch does not have, that is,
#               commits to pull. 0 without an upstream.
#   pushed      True when there is an upstream and nothing to push. Uncommitted
#               changes do not count; see dirty.
#   dirty       True when any of staged, changed, untracked or conflicted is not
#               zero.
#   staged      Tracked files with a change in the index, ready to commit.
#   changed     Tracked files with a change in the working tree not yet staged.
#               A file changed again after staging counts in staged and changed.
#   untracked   Entries git does not track and does not ignore. A new folder
#               counts once, however many files it holds.
#   conflicted  Files with an unresolved merge conflict.
#   message     '<branch> <commit> ' then the non-zero counts, ahead and behind,
#               and 'no upstream', such as 'main 1a2b3c4 2 changed, ahead 1'; the
#               last part is 'clean' when there is nothing to report.
[pscustomobject][ordered]@{
    status     = $status
    branch     = $branch
    commit     = $commit
    upstream   = $upstream
    ahead      = $ahead
    behind     = $behind
    pushed     = $pushed
    dirty      = $dirty
    staged     = $staged
    changed    = $changed
    untracked  = $untracked
    conflicted = $conflicted
    message    = "$branch $commit " + ($notes -join ', ')
} | ConvertTo-Json -Compress
