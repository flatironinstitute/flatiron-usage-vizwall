# SlurmWatch v2

An Electron application to display live slurm usage metrics at the Flatiron Institute.

Built with [Electron Forge](https://www.electronforge.io/).

## Local Development

Before proceeding with Slurm Watch you need to install [Node.js](https://nodejs.dev/).

Once you have copied this repository locally, install Electron and the other neccessary npm packages by running:

```
npm install
```

To start SlurmWatch locally use:

```
npm run start
```

## Notes

### TODO

- [ ] Add Tailwind
- [ ] Add charts from v1:
  - [ ] Stacked bar: CPUs free by location / total CPU nodes available
  - [ ] Doughnuts: GPUs free by location (rusty & popeye)
  - [ ] Table: Current queue length by center
  - [ ] Line graph: Nodes by center over 7 days
  - [ ] Bubbleplot: Wait time by center over 24 hours

### Charts To Do?

- [ ] _Tbd:_ Iron broadwell & skylight
- [ ] CPU nodes currently allocated by account (or partition) aka center as a sunburst chart

### Misc todos

- [ ] Style current queue table
- [ ] Combine flexboxgrid & stylesheet and minify
- [ ] Reorder barchart according to keys provided
- [ ] Style and add cool fonts
- [ ] Improve labeling
- [ ] Add open GPUs/CPUs as number under the donut
- [ ] Handle erroring on bubbleplot
- [ ] Hover on bubbleplot

### Other charts for potential v2?

- CPU efficiency by center as racecars
- Toggle num queue items by center with queue items by location (gordon etc)
