// var xhr = new XMLHttpRequest();
// var data;
// var nodes;
// var serverData;
// var datasetList = [];
// var network;
// var e;
// var searchError;
// var tscListTable;

window.onload = function () {
    initBrowser();
}

var myTronWeb;
var matrixContract;

function initBrowser() {

    // var web3 = new Web3(new Web3.providers.HttpProvider(NODE_URL));
    myTronWeb = new TronWeb(NODE_URL, NODE_URL, NODE_URL);
    // const myTronWeb = new myTronWeb({
    //     fullHost: NODE_URL,
    //     // privateKey: 'e546831c355706d8018d97e486ec6de0a21e137f64781a72d8217853d38a6150'
    // })
    matrixContract = myTronWeb.contract(ABI, CONTRACT_ADDRESS);
    // return;
    
    var nodeConnections = {};
    var nodeList = [];
    var rawNodes = [];
    var rawEdges = [];

    // console.log(matrixContract);
    myTronWeb.getEventResult(CONTRACT_ADDRESS, {eventName: 'MatrixCreated', sort: "block_timestamp", size: 200})
    .then((res) => {
        console.log(res);
        
        res.forEach(element => {
            nodeConnections[element['result']['matrixId']] = element['result']['parentMatrixId'];
            nodeList.push(element['result']);
        });
        console.log(nodeConnections);
        console.log(nodeList);
        
        for (let i = 0; i < nodeList.length; i++) {
            rawNodes.push({
                id: nodeList[i].matrixId,
                label: nodeList[i].matrixId + "\n" + myTronWeb.address.fromHex(nodeList[i].userAddress).slice(0,9)
            });
            let parentMatrixId = nodeConnections[nodeList[i].matrixId];
            if (parentMatrixId != 0) {
                rawEdges.push({
                    "from": parentMatrixId,
                    "to": nodeList[i].matrixId,
                })
            }
        }
        var nodes = new vis.DataSet(rawNodes);
        var edges = new vis.DataSet(rawEdges);

        var container = document.getElementById("matrixNetwork");
        var data = {
            nodes: nodes,
            edges: edges,
        };

        var options = {
            layout: {
                hierarchical: {
                    direction: "UD",
                    sortMethod: "directed",
                    levelSeparation: 200,
                    nodeSpacing: 200,
                    treeSpacing: 125,
                    shakeTowards: "roots",

                }
            },
            physics: {
                enabled: false
            },
            // configure: {
            //     filter: function (option, path) {
            //         if (path.indexOf("hierarchical") !== -1) {
            //             return true;
            //         }
            //         return false;
            //     },
            //     showButton: false
            // },
        };

        var network = new vis.Network(container, data, options);

        network.on("select", function (params) {

            // console.log(myTronWeb.address.fromHex(nodeList.find(x => x.matrixId === params.nodes[0]).userAddress));
            if (params.nodes[0] !== undefined) {
                
                document.getElementById("selection").innerHTML = "Selected: " + myTronWeb.address.fromHex(nodeList.find(x => x.matrixId === params.nodes[0]).userAddress);
            } else {
                document.getElementById("selection").innerHTML = "Selected: -";
            }
        });
    });

    // var data = {
    //     nodes: nodes,
    //     edges: edges,
    //   };
    //   // create a network
    //   var container = document.getElementById("mynetwork");
    //   var options = {
    //     layout: {
    //       hierarchical: {
    //         direction: "UD",
    //         sortMethod: "directed",
    //       },
    //     },
    //     interaction: { dragNodes: false },
    //     physics: {
    //       enabled: false,
    //     },
    //     configure: {
    //       filter: function (option, path) {
    //         if (path.indexOf("hierarchical") !== -1) {
    //           return true;
    //         }
    //         return false;
    //       },
    //       showButton: false,
    //     },
    //   };
    //     var network = new vis.Network(container, data, options);            
}

// function inputAddressHandler() {
//     if (e.value.length === 42) {
//         const inputText = e.value.toString().toLowerCase();
//         let elems = datasetList.filter(e => {
//             return (e['label'].toLowerCase() === inputText)
//         });
//         if (elems.length > 0) {
//             let elemId = elems[0].id;
//             let elemPosX = network.body.nodes[elemId].x;
//             let elemPosY = network.body.nodes[elemId].y;

//             network.view.moveTo({position: {x: elemPosX, y: elemPosY}, scale: 0.6});
//             searchError.textContent = '';
//         } else {
//             searchError.textContent = 'Address not found';
//             console.log('ошибка')
//         }
//     } else {
//         searchError.textContent = '';
//     }
// }

// function fadeOutnojquery(el) {
//     el.style.opacity = 1;
//     var interhellopreloader = setInterval(function () {
//         el.style.opacity = el.style.opacity - 0.05;
//         if (el.style.opacity <= 0.05) {
//             clearInterval(interhellopreloader);
//             hellopreloader.style.display = "none";
//         }
//     }, 16);
// }

// xhr.onload = function (e) {
//     if (xhr.readyState === 4) {
//         if (xhr.status === 200) {

//             setTimeout(function () {
//                 fadeOutnojquery(hellopreloader);
//             }, 1000);
//             // console.log(xhr.responseText);
//             const resp_data = JSON.parse(xhr.responseText)
//             dataOnLoad(resp_data)
//         } else {
//             console.error(xhr.statusText);
//         }
//     }
// };

// function dataOnLoad(serverDataVar) {
//     serverData = serverDataVar
//     // settings
//     document.getElementById("totalPartners").innerHTML = "Total partners: " + serverData["nodes"].length;
//     const totalFrees = serverData['nodesInfo'].filter(obj => {
//         return obj.status === 1
//     }).length;
//     const totalFreesTsc = serverData['nodesInfo'].filter(obj => {
//         return obj.status === 2
//     }).length;
//     const totalPrimes = serverData['nodesInfo'].filter(obj => {
//         return obj.status === 3
//     }).length;

//     document.getElementById("totalStatuses").innerHTML = `(Prime: ${totalPrimes}, FreeTSC: ${totalFreesTsc}, Free: ${totalFrees})`;

//     document.getElementById("totalTsc").innerHTML = `Total Tsc: ${serverDataVar['tscs'].length}`;

//     document.getElementById("cashbackSenderWallet").innerHTML = "cashbackSenderWallet: " + serverData["parameters"]["cashbackSenderWallet"];
//     document.getElementById("companyWallet").innerHTML = "companyWallet: " + serverData["parameters"]["companyWallet"];
//     document.getElementById("maxPaymentLayers").innerHTML = "maxPaymentLayers: " + serverData["parameters"]["maxPaymentLayers"];
//     document.getElementById("primeParentPercent").innerHTML = "primeParentPercent: " + serverData["parameters"]["primeParentPercent"] + "%";
//     document.getElementById("primeStatusCost").innerHTML = "primeStatusCost: " + serverData["parameters"]["primeStatusCost"] + "wei";

//     var tableArr = ['<table>'];
//     tableArr.push('<tr><td>' + 'id' + '</td><td>' + 'owner' + '</td></tr>')
//     for (let i = 0; i < serverData['tscs'].length; i++) {
//         tableArr.push('<tr><td>' + Web3.utils.toUtf8(serverData['tscs'][i]['id']) + '</td><td>' + serverData['tscs'][i]['owner'] + '</td></tr>');
//     }
//     tableArr.push('</table>');
//     tscListTable.innerHTML = tableArr.join('\n')
//     // datasetList.push({
//     //     id: 0,
//     //     label: 'IMC',
//     //     color: "#461c7d",
//     //     size: 200,
//     //     group: 'imc'
//     // });
//     for (let i = 0; i < serverData['nodes'].length; i++) {
//         let nodeColor = "";
//         switch (serverData['nodesInfo'][i]["status"]) {
//             case 0:
//                 nodeColor = "#d0c7dc";
//                 break;
//             case 1:
//                 nodeColor = "#00b050";
//                 break;
//             case 2:
//                 nodeColor = "#36ad97";
//                 break;
//             case 3:
//                 nodeColor = "#4bacc6";
//                 break;
//             case 4:
//                 nodeColor = "#d96c6c";
//                 break;
//         }
//         datasetList.push({
//             id: i + 1,
//             label: serverData['nodes'][i],
//             color: nodeColor
//         });
//     }

//     nodes = new vis.DataSet(datasetList);

//     for (let i = 0; i < serverData['edges'].length; i++) {
//         serverData['edges'][i]["arrows"] = "to"
//     }
//     var edges = new vis.DataSet(serverData['edges']);

//     var container = document.getElementById('mynetwork');
//     data = {
//         nodes: nodes,
//         edges: edges
//     };
//     var options = {
//         layout: {
//             hierarchical: {
//                 direction: "UD",
//                 sortMethod: "directed",
//                 levelSeparation: 400,
//                 nodeSpacing: 825,
//                 treeSpacing: 825,
//                 shakeTowards: "roots",

//             }
//         },
//         interaction: {
//             dragNodes: false,
//             keyboard: true,
//         },
//         physics: {
//             enabled: false
//         }, /**
//          configure: {
//             filter: function (option, path) {
//                 if (path.indexOf("hierarchical") !== -1) {
//                     return true;
//                 }
//                 return false;
//             },
//             showButton: false
//         },*/
//         nodes: {
//             shape: "dot",
//             size: 30,
//             font: {
//                 size: 32,
//                 color: "#ffffff"
//             },
//             borderWidth: 2
//         },
//         edges: {
//             width: 2,
//             smooth: {
//                 type: "cubicBezier",
//                 roundness: 0.2
//             }
//         },
//     };
//     startNetwork(container, data, options)
// }


// function startNetwork(container, data, options) {
//     network = new vis.Network(container, data, options);
//     network.redraw()

//     // addEventListener
//     network.on("select", function (params) {
//         let selected = serverData['nodes'][params.nodes[0] - 1];
//         if (selected !== undefined) {
//             document.getElementById("selection").innerHTML = "Selected: " + selected;
//         } else {
//             document.getElementById("selection").innerHTML = "Selected: -"
//         }
//     });
// }