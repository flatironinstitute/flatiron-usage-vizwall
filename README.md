# Slurm Watch

An Electron application to display live slurm usage metrics at the Flatiron Institute.

# Notes

## How-To

    - make it into an electron app with x-screensaver
    - npm package

## Charts to produce

    1. GPUs free by location (rusty & popeye)
    2. Free cpus at each center on rusty *toggle with CPUs used at each center on rusty
    3. CPUS free by other locations (bnl, ib, popeye)
    4. Currently allocated cpus by center (except popeye for now)
    5. CPU efficiency by center *racecars
    6. Num queue items by center / location (toggle animated)

## V2 Features

    1. spikes in the week?
    2. avg wait time

## TODO:

1. Combine flexboxgrid & stylesheet and minify
2. Refactor barchart into something more reusable
3. Add loading display
4. Reorder barchart according to keys provided
