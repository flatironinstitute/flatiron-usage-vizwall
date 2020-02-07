interface PrometheusObject {
  metric: any;
  value: any[];
}

export function drawTable(
  element: string,
  dataset: PrometheusObject[],
  labels: string[],
  title: string
) {
  const ctx = document.getElementById(element) as HTMLCanvasElement;
  ctx.innerHTML = "";
  console.log("CLEARED EXISTING CONTEXT", ctx);
  let table = document.createElement("table");
  let thead = document.createElement("thead");
  let trHead = document.createElement("tr");
  let tbody = document.createElement("tbody");

  let accounts: string[] = ["cca", "ccb", "ccm", "ccq", "popeye"];

  ctx.appendChild(table);
  table.appendChild(thead);
  thead.appendChild(trHead);
  table.appendChild(tbody);

  labels.forEach(label => {
    let th = document.createElement("th");
    th.innerHTML = label;
    trHead.appendChild(th);
  });

  function buildRow(row: PrometheusObject) {
    let tr = document.createElement("tr");
    let td1 = document.createElement("td");
    let td2 = document.createElement("td");
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

  for (let row of dataset) {
    buildRow(row);
    //remove accounts from list
    accounts = accounts.filter(account => account !== row.metric.account);
  }

  if (accounts.length) {
    for (let row of accounts) {
      let stub: PrometheusObject = {
        metric: { account: row },
        value: [0, "0"]
      };
      buildRow(stub);
    }
  }
}

module.exports = { drawTable };
