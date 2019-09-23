// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
console.log("I am preloading now");
const base64 = require("base-64");

window.addEventListener("DOMContentLoaded", () => {
  console.log("I am preloading dom content loaded");
  let base =
    "http://prometheus.flatironinstitute.org/api/v1/query?query=node_boot_time_seconds";
  // let query = 'slurm_node_cpus{state="free"}';
  // let url = base + encodeURI(query);
  fetch(base, {
    headers: new Headers({
      Authorization: `Basic ${base64.encode(`prom:etheus`)}`
    })
  })
    .then(res => res.json())
    .then(body => console.log(body));

  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});
