import * as d3 from "d3";
import { log } from "./shared";

interface QueryObject {
  label: string;
  name: string;
  query: string;
  range_offset?: number;
  range_unit?: "day";
  range_step?: string;
}

export interface PrometheusResult {
  metric: { [key: string]: string };
  value: [number, string];
}

export interface PrometheusResultsObject {
  [key: string]: PrometheusResult[];
}

const queries: QueryObject[] = [
  {
    label: `Slurm Job Seconds`,
    name: `slurm_job_seconds`,
    query: "slurm_job_seconds",
  },
  {
    label: `Slurm Job CPUs`,
    name: `slurm_job_cpus`,
    query: `slurm_job_cpus{state="running",nodes!="gpu"}`,
  },
  {
    label: "Free CPUs (non-GPU) by location",
    name: "cpus_free",
    query: 'sum(slurm_node_cpus{state="free",nodes!="gpu"}) by (cluster,nodes)',
  },
  {
    label: "Allocated CPUs (non-GPU) by location",
    name: "cpus_allocated",
    query:
      'sum(slurm_node_cpus{state="alloc",nodes!="gpu"}) by (cluster,nodes)',
  },
  {
    label: "Percent Free CPUs (non-GPU) by location",
    name: "cpus_percent_free",
    query:
      'sum(slurm_node_cpus{state="free",nodes!="gpu"}) by (cluster,nodes) / sum(slurm_node_cpus{nodes!="gpu"}) by (cluster,nodes)',
  },
  {
    label: "GPUs free by location",
    name: "gpus_free",
    query: 'sum(slurm_node_gpus{state="free",nodes="gpu"}) by (cluster)',
  },
  {
    label: "GPUs allocated by location",
    name: "gpus_allocated",
    query: 'sum(slurm_node_gpus{state="alloc",nodes="gpu"}) by (cluster)',
  },
  {
    label: "Slurm pending job requests",
    name: "slurm_pending_jobs",
    query: 'sum(slurm_job_count{state="pending"}) by (account)',
  },
];

const range_queries: QueryObject[] = [
  {
    label: "Rusty queue wait time over 24 hours",
    name: "rusty_wait_time",
    query:
      'sum(slurm_job_seconds{cluster="iron",state="pending"}) by (account)',
    range_offset: 1,
    range_unit: "day",
    range_step: "15m",
  },
  {
    label: "Rusty queue length over 24 hours",
    name: "rusty_queue_length",
    query: 'sum(slurm_job_count{state="pending"}) by (account)',
    range_offset: 1,
    range_unit: "day",
    range_step: "15m",
  },
  {
    label: "Node counts by center for the last 7 Days",
    name: "node_count",
    query: 'sum(slurm_job_nodes{state="running"}) by (account)',
    range_offset: 7,
    range_unit: "day",
    range_step: "90m",
  },
];

/**
 * Fetch data from Prometheus
 */
async function fetch_prometheus_data(
  query_object: QueryObject,
  is_range_query: boolean
): Promise<PrometheusResult[]> {
  log("Fetching data", query_object, is_range_query);
  const base = is_range_query
    ? "http://prometheus.flatironinstitute.org/api/v1/query_range"
    : "http://prometheus.flatironinstitute.org/api/v1/query";
  const url = new URL(base);
  const search_params = new URLSearchParams({
    query: query_object.query,
  });
  if (is_range_query) {
    const end = new Date();
    if (query_object.range_unit === "day") {
      const start = d3.timeDay.offset(end, -query_object.range_offset);
      search_params.set("start", start.toISOString());
      search_params.set("end", end.toISOString());
      search_params.set("step", query_object.range_step);
    }
  }
  url.search = search_params.toString();
  log("URL", url.toString());
  return (
    d3
      .json(url.toString())
      .then((body: any) => {
        if (body.status === "success") {
          const results: PrometheusResult[] = body.data.result;
          return results;
        } else {
          throw new Error(`Prometheus error: ${body.error}`);
        }
      })
      // tslint:disable-next-line
      .catch((err) => {
        console.log(Error(err.statusText));
        return [];
      })
  );
}

export async function fetch_all_prometheus_data(): Promise<{
  [key: string]: PrometheusResult[];
}> {
  const non_range_data = queries.map(async (query_object) => ({
    query: query_object,
    data: await fetch_prometheus_data(query_object, false),
  }));

  const range_data = range_queries.map(async (query_object) => ({
    query: query_object,
    data: await fetch_prometheus_data(query_object, true),
  }));

  return Promise.all([...non_range_data, ...range_data]).then((arr) => {
    return Object.fromEntries(arr.map(({ query, data }) => [query.name, data]));
  });
}
