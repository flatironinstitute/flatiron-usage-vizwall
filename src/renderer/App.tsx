import type { Signal } from "@preact/signals-react";
import type { PrometheusResult, PrometheusResultsObject } from "./fetch-data";

import React from "react";
import { signal, computed } from "@preact/signals-react";
import * as d3 from "d3";
import { log } from "./shared";
import { fetch_all_prometheus_data } from "./fetch-data";

interface PrometheusRow {
  account?: string;
  cluster?: string;
  nodes?: string;
  user?: string;
  date: Date;
  value: number;
  raw: PrometheusResult;
  path?: string;
}

const data_signal: Signal<PrometheusResultsObject> = signal(null);

const data_loaded_signal: Signal<boolean> = computed(
  () => data_signal.value !== null
);

function SunburstChart() {
  const size = 1000;
  const radius = size * 0.5;
  const padding = 3;

  const get_path = (d: PrometheusResult) => {
    const { metric } = d;
    const { account, cluster, nodes, user } = metric;
    const path = [account, cluster, nodes, user].join(`/`);
    return path;
  };

  const placeholder_data: PrometheusResult[] = [];

  // const data_raw = data_signal.value?.slurm_job_seconds ?? placeholder_data;
  const data_raw = data_signal.value?.slurm_job_cpus ?? placeholder_data;
  const data_flat: PrometheusRow[] = data_raw.map((d) => {
    const { metric, value } = d;
    const path = get_path(d);
    return {
      ...metric,
      date: new Date(value[0] * 1e3),
      value: Number(value[1]),
      raw: d,
      path,
    };
  });

  const descendants: d3.HierarchyRectangularNode<PrometheusRow>[] = (() => {
    if (!data_flat.length) return [];
    const stratifier = d3.stratify<PrometheusRow>().path((d) => d.path);
    const hierarchy = stratifier(data_flat);
    // Compute the numeric value for each entity
    // This adds a `value` property to each node
    hierarchy
      .sum((d) => d?.value)
      .sort((a, b) => d3.ascending(a.value, b.value));
    // Compute the layout. This adds x0, x1, y0, y1, and data to each node
    const hierarchy_with_coords = d3
      .partition<PrometheusRow>()
      .size([2 * Math.PI, radius])(hierarchy);
    log(`hierarchy`, hierarchy_with_coords);
    return hierarchy_with_coords.descendants();
  })();

  const arc_generator = d3
    .arc<d3.HierarchyRectangularNode<PrometheusRow>>()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, (2 * padding) / radius))
    .padRadius(radius / 2)
    .innerRadius((d) => d.y0)
    .outerRadius((d) => d.y1 - padding);

  // log(`descendants`, descendants);

  const paths: JSX.Element[] = descendants.map((d, i) => {
    if (d.depth === 0) return null;
    const path_definition = arc_generator(d);
    return (
      <path
        key={d.id}
        data-id={d.id}
        d={path_definition}
        stroke="none"
        fill="rgba(255, 255, 255, 0.3)"
      ></path>
    );
  });

  const labels: JSX.Element[] = descendants.map((d, i) => {
    const label = d.id.split(`/`).at(-1);
    if (!label.length) return null;
    if (((d.y0 + d.y1) / 2) * (d.x1 - d.x0) < 20) return null;
    const centroid = arc_generator.centroid(d);
    const [x, y] = centroid;
    const theta = (d.x0 + d.x1) / 2;
    const theta_degrees = (theta * 180) / Math.PI;
    const rotation = theta_degrees + 90;
    const flip = rotation < 270 ? 180 : 0;
    const transform = `translate(${x}, ${y}) rotate(${rotation + flip})`;
    return (
      <g
        transform={transform}
        style={{ textAnchor: `middle` }}
        data-rotation={rotation}
      >
        <text key={d.id} dy={"0.2rem"} fill="currentColor">
          {label}
        </text>
      </g>
    );
  });

  return (
    // <div className="relative outline outline-4 outline-orange-500 col-span-6 row-span-5">
    <div className="relative col-span-6 row-span-5">
      <svg
        className="overflow-visible absolute w-full h-full text-white text-xs"
        viewBox={`${-(size / 2)} ${-(size / 2)} ${size} ${size}`}
        style={{ vectorEffect: `non-scaling-stroke` }}
      >
        {paths}
        {labels}
      </svg>
    </div>
  );
}

function GridContainer({
  children,
}: {
  children?: React.ReactNode;
}): JSX.Element {
  return (
    <div className="grid w-full aspect-video grid-cols-12 grid-rows-6">
      {/* <div className="grid outline outline-5 outline-red-500 w-full aspect-video grid-cols-12 grid-rows-6"> */}
      {children}
    </div>
  );
}

export default function App() {
  React.useEffect(() => {
    log("App mounted");
    log(`Fetching data...`);
    fetch_all_prometheus_data().then((data) => {
      log("Data fetched", data);
      data_signal.value = data;
    });
  }, []);
  return (
    <>
      <div>loaded data? {data_loaded_signal.value.toString()}</div>
      <GridContainer>
        <SunburstChart />
      </GridContainer>
    </>
  );
}
