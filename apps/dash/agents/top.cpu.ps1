# Busiest processes by total CPU seconds.
#
# The value is the CPU time a process has used since it started, not a recent
# window and not a current percentage:
#
# - It is Get-Process's CPU property, TotalProcessorTime in seconds: user and
#   kernel time added up across every core, so a process keeping 4 cores busy for
#   10 seconds reports 40s.
# - It only grows while the process runs, and starts again from 0 when the process
#   restarts. A long-running idle process can outrank one that is busy now.
# - Each process is its own row, so a name such as chrome can appear more than once.
# - A process this user cannot open, such as another user's or a protected one,
#   has no CPU value and is left out.
#
# The fields of each item: label is the process name, cpu is the seconds as text,
# such as '125s'.
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
