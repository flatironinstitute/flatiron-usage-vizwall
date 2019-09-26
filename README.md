# Slurm Watch

An Electron application to display live slurm usage metrics at the Flatiron Institute.

## Completed charts

1. Stacked bar: CPUs free by location / total CPU nodes available

## Charts to produce

1. Doughnuts: GPUs free by location (rusty & popeye)
2. TBD: Currently queued jobs by location
3. TBD: Iron broadwell & skylight - CPU nodes currently allocated by account (or partition) aka center

## Misc todos

1. Fix doughnut gpu chart
2. Combine flexboxgrid & stylesheet and minify
3. Reorder barchart according to keys provided
4. Style and add cool logo.

## Other charts for potential v2?

1. spikes in the week or another bit of timeseries data
2. avg wait time
3. CPU efficiency by center \*racecars
4. Num queue items by center / location (toggle animated)
