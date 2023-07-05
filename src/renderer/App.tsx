import type { Signal } from "@preact/signals-react";
import type { PrometheusResult, PrometheusResultsObject } from "./fetch-data";

import React from "react";
import { signal, computed } from "@preact/signals-react";
import * as d3 from "d3";
import { log } from "./shared";
import { fetch_all_prometheus_data } from "./fetch-data";

const colors = {
  ccq: {
    r: 132,
    g: 91,
    b: 142,
  },
  cca: {
    r: 206,
    g: 50,
    b: 50,
  },
  ccm: {
    r: 246,
    g: 134,
    b: 45,
  },
  ccb: {
    r: 129,
    g: 173,
    b: 74,
  },
  ccn: {
    r: 0,
    g: 128,
    b: 158,
  },
};

interface PrometheusMetric {
  account?: string;
  cluster?: string;
  nodes?: string;
  user?: string;
  partition?: string;
}

interface NodeData {
  path: string;
  value: number;
  raw: Array<PrometheusResult>;
}

const data_signal: Signal<PrometheusResultsObject> = signal(null);

const data_loaded_signal: Signal<boolean> = computed(
  () => data_signal.value !== null
);

function get_color(d: d3.HierarchyRectangularNode<NodeData>) {
  const { id } = d;
  const parts = id.split(`/`);
  const center = parts.find((d) => d in colors);
  if (center) {
    const rgb = colors[center];
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
  }
  return `rgba(255, 255, 255, 0.2)`;
}

function SunburstChart({
  data_key,
  hierarchy,
}: {
  data_key: string;
  hierarchy: Array<keyof PrometheusMetric>;
}): JSX.Element {
  const size = 1000;
  const radius = size * 0.5;
  const padding = 3;

  const get_path = (d: PrometheusResult) => {
    const { metric } = d;
    const path = hierarchy.map((key) => metric[key]).join(`/`);
    return path;
  };

  const placeholder_data: PrometheusResult[] = [];

  const data_raw = data_signal.value?.[data_key] ?? placeholder_data;
  const data_flat_with_duplicates: NodeData[] = data_raw.map((d) => {
    const { value } = d;
    const path = get_path(d);
    return {
      path,
      value: Number(value[1]),
      raw: [d],
    };
  });

  const data_flat: NodeData[] = d3
    .groups(data_flat_with_duplicates, (d) => d.path)
    .map(([path, values]) => {
      return {
        path,
        value: d3.sum(values, (d) => d.value),
        raw: values.map((d) => d.raw).flat(),
      };
    })
    .flat();

  const descendants: d3.HierarchyRectangularNode<NodeData>[] = (() => {
    if (!data_flat.length) return [];
    const stratifier = d3.stratify<NodeData>().path((d) => d.path);
    const hierarchy = stratifier(data_flat);
    // Compute the numeric value for each entity
    // This adds a `value` property to each node
    hierarchy
      .sum((d) => d?.value)
      .sort((a, b) => d3.ascending(a.value, b.value));
    // Compute the layout. This adds x0, x1, y0, y1, and data to each node
    const hierarchy_with_coords = d3
      .partition<NodeData>()
      .size([2 * Math.PI, radius])(hierarchy);
    log(`hierarchy`, hierarchy_with_coords);
    return hierarchy_with_coords.descendants();
  })();

  const arc_generator = d3
    .arc<d3.HierarchyRectangularNode<NodeData>>()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, (2 * padding) / radius))
    .padRadius(radius / 2)
    .innerRadius((d) => d.y0)
    .outerRadius((d) => d.y1 - padding);

  // log(`data_raw`, data_raw);
  // log(`data_flat`, data_flat);
  // log(`descendants`, descendants);

  const paths: JSX.Element[] = descendants.map((d, i) => {
    if (d.depth === 0) return null;
    const path_definition = arc_generator(d);
    const fill = get_color(d);
    return (
      <path
        key={d.id}
        data-id={d.id}
        d={path_definition}
        stroke="none"
        fill={fill}
      ></path>
    );
  });

  const labels: JSX.Element[] = descendants.map((d, i) => {
    let label = d.id.split(`/`).at(-1);
    if (!label.length) return null;
    if (((d.y0 + d.y1) / 2) * (d.x1 - d.x0) < 20) return null;
    if (label === `iron`) label = `rusty`;
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
    <div className="relative col-span-6 row-span-5">
      <div className="absolute top-0 left-0 w-[1000px] text-xs">
        <div>{data_key}</div>
        <div>{hierarchy.join(" -> ")}</div>
      </div>
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
      <div className="h-10" />
      <GridContainer>
        <SunburstChart
          data_key="slurm_job_cpus"
          hierarchy={[`account`, `cluster`, `nodes`, `user`]}
        />
      </GridContainer>
      <GridContainer>
        <SunburstChart
          data_key="slurm_job_cpus"
          hierarchy={[`account`, `cluster`, `user`]}
        />
      </GridContainer>
      <GridContainer>
        <SunburstChart
          data_key="slurm_job_cpus"
          hierarchy={[`cluster`, `account`, `user`]}
        />
      </GridContainer>
    </>
  );
}
