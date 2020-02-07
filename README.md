# Slurm Watch

An Electron application to display live slurm usage metrics at the Flatiron Institute.

## Startup Scripts

To start SlurmWatch locally use:

```
npm run start
```

To run the linter and auto-correct linting errors run:

```
npm run lint
```

## Notes

### Completed charts

- Stacked bar: CPUs free by location / total CPU nodes available
- Doughnuts: GPUs free by location (rusty & popeye)

### ToDo

- Finish Queue Chart
  - 2 Queries:
    1. Queue wait times @ 1min intervals by center
    2. Queue length @1 min intervals by center
  - Combine queries 1 & 2 into a time dot plot
- Stacked line graph of core hours by center over 7 days
- _Tbd:_ Iron broadwell & skylight - CPU nodes currently allocated by account (or partition) aka center as a sunburst chart

### Misc todos

- Style current queue table
- Combine flexboxgrid & stylesheet and minify
- Reorder barchart according to keys provided
- Style and add cool fonts
- Improve labeling
- Add open GPUs/CPUs as number under the donut

### Other charts for potential v2?

- CPU efficiency by center as racecars
- Toggle num queue items by center with queue items by location (gordon etc)
