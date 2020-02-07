"use strict";
exports.__esModule = true;
function drawTable(element, dataset, labels, title) {
    var ctx = document.getElementById(element);
    ctx.innerHTML = "";
    console.log("CLEARED EXISTING CONTEXT", ctx);
    var table = document.createElement("table");
    var thead = document.createElement("thead");
    var trHead = document.createElement("tr");
    var tbody = document.createElement("tbody");
    var accounts = ["cca", "ccb", "ccm", "ccq", "popeye"];
    ctx.appendChild(table);
    table.appendChild(thead);
    thead.appendChild(trHead);
    table.appendChild(tbody);
    labels.forEach(function (label) {
        var th = document.createElement("th");
        th.innerHTML = label;
        trHead.appendChild(th);
    });
    function buildRow(row) {
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");
        if (row.metric.account !== "popeye") {
            td1.innerHTML = row.metric.account;
        }
        else {
            td1.innerHTML = "other";
        }
        td2.innerHTML = row.value ? row.value[1] : "";
        tbody.appendChild(tr);
        tr.appendChild(td1);
        tr.appendChild(td2);
    }
    var _loop_1 = function (row) {
        buildRow(row);
        //remove accounts from list
        accounts = accounts.filter(function (account) { return account !== row.metric.account; });
    };
    for (var _i = 0, dataset_1 = dataset; _i < dataset_1.length; _i++) {
        var row = dataset_1[_i];
        _loop_1(row);
    }
    if (accounts.length) {
        for (var _a = 0, accounts_1 = accounts; _a < accounts_1.length; _a++) {
            var row = accounts_1[_a];
            var stub = {
                metric: { account: row },
                value: [0, "0"]
            };
            buildRow(stub);
        }
    }
}
exports.drawTable = drawTable;
module.exports = { drawTable: drawTable };
//# sourceMappingURL=table.js.map