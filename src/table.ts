interface PrometheusObject {
  metric: any;
  value: any[];
}

export function drawTable(
  element: string,
  dataset: PrometheusObject[],
  labels: string[],
  title: string,
) {
  const ctx = document.getElementById(element) as HTMLCanvasElement;
  ctx.innerHTML = "";
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  const tbody = document.createElement("tbody");

  let accounts: string[] = ["cca", "ccb", "ccm", "ccq", "popeye"];

  ctx.appendChild(table);
  table.appendChild(thead);
  thead.appendChild(trHead);
  table.appendChild(tbody);

  labels.forEach((label) => {
    const th = document.createElement("th");
    th.innerHTML = label;
    trHead.appendChild(th);
  });

  function buildRow(row: PrometheusObject) {
    const tr = document.createElement("tr");
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    if (row.metric.account !== "popeye") {
      td1.innerHTML = row.metric.account;
    } else {
      td1.innerHTML = "other";
    }
    td2.innerHTML = row.value ? row.value[1] : "";

    tbody.appendChild(tr);
    tr.appendChild(td1);
    tr.appendChild(td2);
  }

  for (const row of dataset) {
    buildRow(row);
    // remove accounts from list
    accounts = accounts.filter((account) => account !== row.metric.account);
  }

  if (accounts.length) {
    for (const row of accounts) {
      const stub: PrometheusObject = {
        metric: { account: row },
        value: [0, "0"],
      };
      buildRow(stub);
    }
  }
}

module.exports = { drawTable };
