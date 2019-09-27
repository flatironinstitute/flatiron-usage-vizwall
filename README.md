# Slurm Watch

An Electron application to display live slurm usage metrics at the Flatiron Institute.

# Notes

## Completed charts

1. Stacked bar: CPUs free by location / total CPU nodes available
2. Doughnuts: GPUs free by location (rusty & popeye)

## Charts to produce

1. TBD: Currently queued jobs by location
2. TBD: Iron broadwell & skylight - CPU nodes currently allocated by account (or partition) aka center

## V2 Features

1. spikes in the week or another bit of timeseries data
2. avg wait time
3. CPU efficiency by center \*racecars
4. Num queue items by center / location (toggle animated)

## TODO:

1. Combine flexboxgrid & stylesheet and minify
2. Reorder barchart according to keys provided
3. Style and add cool fonts.
4. Improve labeling (show amounts)
