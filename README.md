# Slurm Watch

An Electron application to display live slurm usage metrics at the Flatiron Institute.

## Completed charts

- Stacked bar: CPUs free by location / total CPU nodes available
- Doughnuts: GPUs free by location (rusty & popeye)

## Charts to produce

- TBD: Currently queued jobs by location
- TBD: Iron broadwell & skylight - CPU nodes currently allocated by account (or partition) aka center

## Misc todos

- Combine flexboxgrid & stylesheet and minify
- Reorder barchart according to keys provided
- Style and add cool fonts
- Improve labeling

## Other charts for potential v2?

- spikes in the week or another bit of timeseries data
- avg wait time
- CPU efficiency by center as racecars
- Num queue items by center / location (toggle animated)
