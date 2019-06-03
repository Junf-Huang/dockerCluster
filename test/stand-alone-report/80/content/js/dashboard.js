/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 6;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 98.14655172413794, "KoPercent": 1.853448275862069};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3446120689655172, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.44494584837545126, 500, 1500, "BuyBook"], "isController": false}, {"data": [0.1118421052631579, 500, 1500, "SearchBooks"], "isController": false}, {"data": [0.2976391231028668, 500, 1500, "GetBook"], "isController": false}, {"data": [0.5460176991150443, 500, 1500, "Login"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2320, 43, 1.853448275862069, 8558.476724137938, 56, 137853, 30818.8, 49617.749999999956, 81510.43, 6.583147709376729, 35.60125978959465, 0.9737775864392831], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["BuyBook", 554, 10, 1.8050541516245486, 9015.012635379067, 73, 109709, 31538.0, 34255.25, 62462.700000000215, 1.873723230109447, 0.6683356628042263, 0.32162340868812317], "isController": false}, {"data": ["SearchBooks", 608, 14, 2.3026315789473686, 11307.55427631578, 315, 109541, 31622.000000000004, 80338.64999999998, 81703.83, 1.8781837222017996, 23.784823650943572, 0.27416525275163184], "isController": false}, {"data": ["GetBook", 593, 8, 1.349072512647555, 9106.241146711638, 69, 130294, 31336.600000000002, 57410.899999999965, 81499.47999999998, 1.8094715000610277, 10.619124891294398, 0.23359189056206517], "isController": false}, {"data": ["Login", 565, 11, 1.9469026548672566, 4577.619469026547, 56, 137853, 7646.6, 17088.09999999999, 78194.50000000006, 1.6219692141630926, 3.3563599359609237, 0.2376267881134058], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 39.100.96.6:8080 failed to respond", 14, 32.55813953488372, 0.603448275862069], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException\/Non HTTP response message: Connection reset", 26, 60.46511627906977, 1.1206896551724137], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to 39.100.96.6:8080 [\\\/39.100.96.6] failed: \\u8FDE\\u63A5\\u8D85\\u65F6 (Connection timed out)", 3, 6.976744186046512, 0.12931034482758622], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2320, 43, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Connection reset", 26, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 39.100.96.6:8080 failed to respond", 14, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to 39.100.96.6:8080 [\\\/39.100.96.6] failed: \\u8FDE\\u63A5\\u8D85\\u65F6 (Connection timed out)", 3, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["BuyBook", 554, 10, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Connection reset", 7, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 39.100.96.6:8080 failed to respond", 3, null, null, null, null, null, null], "isController": false}, {"data": ["SearchBooks", 608, 14, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Connection reset", 9, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 39.100.96.6:8080 failed to respond", 5, null, null, null, null, null, null], "isController": false}, {"data": ["GetBook", 593, 8, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Connection reset", 4, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 39.100.96.6:8080 failed to respond", 3, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to 39.100.96.6:8080 [\\\/39.100.96.6] failed: \\u8FDE\\u63A5\\u8D85\\u65F6 (Connection timed out)", 1, null, null, null, null], "isController": false}, {"data": ["Login", 565, 11, "Non HTTP response code: java.net.SocketException\/Non HTTP response message: Connection reset", 6, "Non HTTP response code: org.apache.http.NoHttpResponseException\/Non HTTP response message: 39.100.96.6:8080 failed to respond", 3, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException\/Non HTTP response message: Connect to 39.100.96.6:8080 [\\\/39.100.96.6] failed: \\u8FDE\\u63A5\\u8D85\\u65F6 (Connection timed out)", 2, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
