// @ts-check

import "./index.css";
import d3Time from "d3-time";

/**
 * @typedef {{
 *   label: string;
 *   name: string;
 *   query: string;
 *   range_offset?: number;
 *   range_unit?: "day";
 *   range_step?: string;
 * }} QueryObject
 */

const queries = [
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

/** @type {QueryObject[]} */
const range_queries = [
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

await initialize();

async function initialize() {
  log("Initializing");
  const test = await fetch_prometheus_data(queries[0], false);
  console.log(test);
}

/**
 * Fetch data from Prometheus
 * @param {QueryObject} query_object
 * @param {boolean} is_range_query
 */
async function fetch_prometheus_data(query_object, is_range_query) {
  log("Fetching data", query_object, is_range_query);
  const base = is_range_query
    ? "http://prometheus.flatironinstitute.org/api/v1/query_range"
    : "http://prometheus.flatironinstitute.org/api/v1/query";
  const url = new URL(base);
  const search_params = new URLSearchParams({
    query: query_object.query,
  });
  url.search = search_params.toString();
  log("URL", url.toString());
  // let url = base + encodeURI(queryObj.query);
  // if (isRange) {
  //   const end = moment().subtract(10, "minutes").toISOString();
  //   const start = moment().subtract(queryObj.amount, queryObj.unit).toISOString();
  //   url = url + encodeURI(`&start=${start}&end=${end}&step=${queryObj.step}`);
  // }
  return await fetch(url, {
    headers: new Headers({
      // Authorization: `Basic ${base64.encode(`${user}:${pass}`)}`,
    }),
  })
    .then((res) => res.json())
    .then((body) => {
      if (body.status === "success") {
        return body.data.result;
      } else {
        throw new Error(`Prometheus error: ${body.error}`);
      }
    })
    // tslint:disable-next-line
    .catch((err) => console.log(Error(err.statusText)));
}

function log(...args) {
  console.log(`📊`, ...args);
}
