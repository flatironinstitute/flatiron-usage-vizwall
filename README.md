# Slurm Watch

An Electron application to display live slurm usage metrics at the Flatiron Institute.

## Completed charts

- Stacked bar: CPUs free by location / total CPU nodes available

## Charts to produce

- Doughnuts: GPUs free by location (rusty & popeye)
- TBD: Currently queued jobs by location
- TBD: Iron broadwell & skylight - CPU nodes currently allocated by account (or partition) aka center

## Misc todos

- Fix doughnut gpu chart
- Combine flexboxgrid & stylesheet and minify
- Reorder barchart according to keys provided
- Style and add cool logo.

## Other charts for potential v2?

- spikes in the week or another bit of timeseries data
- avg wait time
- CPU efficiency by center \*racecars
- Num queue items by center / location (toggle animated)
