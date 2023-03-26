A="A"
B="B"
C="C"
D="D"
E="E"
F="F"
G="G"
H="H"
I="I"
J="J"
K="K"
L="L"
M="M"
N="N"
O="O"
P="P"

let selectedLayer = 0
let users = []

states =
    [
        { A: 'Impressions' },
        { B: 'Views',  },
        { C: 'Eligibility' },
        { D: 'Terms and Condition'},
        { E: 'Bookmark'},
        { F: 'Brochure Download'},
        { G: 'Application'},
        { H: 'Partial Filled'},
        { I: 'Application Submitted'},
        { J: 'Notification Push'},
        { K: 'Sponser Website'},
        { L: 'Follow Up Enquiry'},
        { M: 'Follow Up Email'},
        { N: 'Upload Documents'},
        { O: 'Email Verified'},
        { P: 'Phone Verified'},


    ]

var goodColors= ['aqua', 'black', 'violet', 'green',
    'lime' , 'orange', 'purple', 'red','pink'
     ];

async function init() {

    // Since 2.2 you can also author concise templates with method chaining instead of GraphObject.make
    // For details, see https://gojs.net/latest/intro/buildingObjects.html
    const $ = go.GraphObject.make;  // for conciseness in defining templates

    var yellowgrad = $(go.Brush, "Linear", { 0: "rgb(254, 201, 0)", 1: "rgb(254, 162, 0)" });
    var greengrad = $(go.Brush, "Linear", { 0: "#98FB98", 1: "#9ACD32" });
    var bluegrad = $(go.Brush, "Linear", { 0: "#B0E0E6", 1: "#87CEEB" });
    var redgrad = $(go.Brush, "Linear", { 0: "#C45245", 1: "#871E1B" });
    var whitegrad = $(go.Brush, "Linear", { 0: "#F0F8FF", 1: "#E6E6FA" });

    var bigfont = "bold 13pt Helvetica, Arial, sans-serif";
    var smallfont = "bold 11pt Helvetica, Arial, sans-serif";

    // Common text styling
    function textStyle() {
        return {
            margin: 6,
            wrap: go.TextBlock.WrapFit,
            textAlign: "center",
            editable: true,
            font: bigfont
        }
    }

    myDiagram =
        $(go.Diagram, "myDiagramDiv",
            {
                // have mouse wheel events zoom in and out instead of scroll up and down
                "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
                initialAutoScale: go.Diagram.Uniform,
                "linkingTool.direction": go.LinkingTool.ForwardsOnly,
                layout: $(go.LayeredDigraphLayout,
                    {
                        isInitial: false, isOngoing: false,
                        layerSpacing: 50,
                        alignOption: go.LayeredDigraphLayout.AlignAll
                    }),
                "undoManager.isEnabled": true
            });

    // when the document is modified, add a "*" to the title and enable the "Save" button
    myDiagram.addDiagramListener("Modified", e => {
        var button = document.getElementById("SaveButton");
        if (button) button.disabled = !myDiagram.isModified;
        var idx = document.title.indexOf("*");
        if (myDiagram.isModified) {
            if (idx < 0) document.title += "*";
        } else {
            if (idx >= 0) document.title = document.title.slice(0, idx);
        }
    });

    var defaultAdornment =
        $(go.Adornment, "Spot",
            $(go.Panel, "Auto",
                $(go.Shape, { fill: null, stroke: "dodgerblue", strokeWidth: 4 }),
                $(go.Placeholder)),
            // the button to create a "next" node, at the top-right corner
            $("Button",
                {
                    alignment: go.Spot.TopRight,
                    click: addNodeAndLink
                },  // this function is defined below
                new go.Binding("visible", "", a => !a.diagram.isReadOnly).ofObject(),
                $(go.Shape, "PlusLine", { desiredSize: new go.Size(6, 6) })
            )
        );

    // define the Node template
    // myDiagram.nodeTemplate =
    //     $(go.Node, "Auto",
    //         { selectionAdornmentTemplate: defaultAdornment },
    //         new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
    //         // define the node's outer shape, which will surround the TextBlock
    //         $(go.Shape, "Circle",
    //             {
    //                 fill: yellowgrad, stroke: "black",
    //                 portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer",
    //                 toEndSegmentLength: 50, fromEndSegmentLength: 40
    //             },
    //             new go.Binding("fill","color" )),
    //         $(go.TextBlock,new go.Binding("text","freq" )),
    //         $(go.TextBlock, "Page",
    //             {
    //                 margin: 6,
    //                 font: bigfont,
    //                 editable: true
    //             },
    //             new go.Binding("text", "text").makeTwoWay()
    //         ),);

    myDiagram.nodeTemplate =
        $(go.Node, "Vertical",
                {
                  locationSpot: go.Spot.Center,  // Node.location is the center of the Shape
                  locationObjectName: "SHAPE",
                  selectionAdorned: false,
                  selectionChanged: nodeSelectionChanged  // defined below
                },
                $(go.Panel, "Spot",
                        $(go.Shape, "Circle",
                                {
                                  name: "SHAPE",
                                  fill: "lightgray",  // default value, but also data-bound
                                  strokeWidth: 0,
                                  desiredSize: new go.Size(30, 30),
                                  portId: ""  // so links will go to the shape, not the whole node
                                // },new go.Binding("desiredSize","freq",f=>new go.Size(f*4,f*4)),
                                },new go.Binding("desiredSize","layer",l=>((l-selectedLayer)==1 || l==selectedLayer )? new go.Size(50,50) :new go.Size(30,30)),
                                new go.Binding("fill", "isSelected", (s, obj) => s ? "blue" : obj.part.data.color).ofObject()),
                        $(go.TextBlock,{stroke:"white"},
                                new go.Binding("text","freq" ))),
            $(go.Panel, "Auto",  // new panel for text below node
                $(go.TextBlock,
                    {
                        margin: (0,0,0,0),
                        textAlign: "center",
                        font: "bold 12px sans-serif",  // customize font if desired
                        stroke: "blue"
                    },
                    new go.Binding("text", "text")
                )
            )

        );




    myDiagram.nodeTemplateMap.add("Source",
        $(go.Node, "Auto",
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Shape, "RoundedRectangle",
                {
                    fill: bluegrad,
                    portId: "", fromLinkable: true, cursor: "pointer", fromEndSegmentLength: 40
                }),
            $(go.TextBlock, "Source", textStyle(),
                new go.Binding("text", "text").makeTwoWay())
        ));

    myDiagram.nodeTemplateMap.add("DesiredEvent",
        $(go.Node, "Auto",
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Shape, "RoundedRectangle",
                { fill: greengrad, portId: "", toLinkable: true, toEndSegmentLength: 50 }),
            $(go.TextBlock, "Success!", textStyle(),
                new go.Binding("text", "text").makeTwoWay())
        ));

    // Undesired events have a special adornment that allows adding additional "reasons"
    var UndesiredEventAdornment =
        $(go.Adornment, "Spot",
            $(go.Panel, "Auto",
                $(go.Shape, { fill: null, stroke: "dodgerblue", strokeWidth: 4 }),
                $(go.Placeholder)),
            // the button to create a "next" node, at the top-right corner
            $("Button",
                {
                    alignment: go.Spot.BottomRight,
                    click: addReason
                },  // this function is defined below
                new go.Binding("visible", "", a => !a.diagram.isReadOnly).ofObject(),
                $(go.Shape, "TriangleDown", { desiredSize: new go.Size(10, 10) })
            )
        );

    var reasonTemplate = $(go.Panel, "Horizontal",
        $(go.TextBlock, "Reason",
            {
                margin: new go.Margin(4, 0, 0, 0),
                maxSize: new go.Size(200, NaN),
                wrap: go.TextBlock.WrapFit,
                stroke: "whitesmoke",
                editable: true,
                font: smallfont
            },
            new go.Binding("text", "text").makeTwoWay())
    );


    myDiagram.nodeTemplateMap.add("UndesiredEvent",
        $(go.Node, "Auto",
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            { selectionAdornmentTemplate: UndesiredEventAdornment },
            $(go.Shape, "RoundedRectangle",
                { fill: redgrad, portId: "", toLinkable: true, toEndSegmentLength: 50 }),
            $(go.Panel, "Vertical", { defaultAlignment: go.Spot.TopLeft },

                $(go.TextBlock, "Drop", textStyle(),
                    {
                        stroke: "whitesmoke",
                        minSize: new go.Size(80, NaN)
                    },
                    new go.Binding("text", "text").makeTwoWay()),

                $(go.Panel, "Vertical",
                    {
                        defaultAlignment: go.Spot.TopLeft,
                        itemTemplate: reasonTemplate
                    },
                    new go.Binding("itemArray", "reasonsList").makeTwoWay()
                )
            )
        ));

    myDiagram.nodeTemplateMap.add("Comment",
        $(go.Node, "Auto",
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Shape, "Rectangle",
                { portId: "", fill: whitegrad, fromLinkable: true }),
            $(go.TextBlock, "A comment",
                {
                    margin: 9,
                    maxSize: new go.Size(200, NaN),
                    wrap: go.TextBlock.WrapFit,
                    editable: true,
                    font: smallfont
                },
                new go.Binding("text", "text").makeTwoWay())
            // no ports, because no links are allowed to connect with a comment
        ));

    // clicking the button on an UndesiredEvent node inserts a new text object into the panel
    function addReason(e, obj) {
        var adorn = obj.part;
        if (adorn === null) return;
        e.handled = true;
        var arr = adorn.adornedPart.data.reasonsList;
        myDiagram.startTransaction("add reason");
        myDiagram.model.addArrayItem(arr, {});
        myDiagram.commitTransaction("add reason");
    }

    // clicking the button of a default node inserts a new node to the right of the selected node,
    // and adds a link to that new node
    function addNodeAndLink(e, obj) {
        var adorn = obj.part;
        if (adorn === null) return;
        e.handled = true;
        var diagram = adorn.diagram;
        diagram.startTransaction("Add State");
        // get the node data for which the user clicked the button
        var fromNode = adorn.adornedPart;
        var fromData = fromNode.data;
        // create a new "State" data object, positioned off to the right of the adorned Node
        var toData = { text: "new" };
        var p = fromNode.location;
        toData.loc = p.x + 200 + " " + p.y;  // the "loc" property is a string, not a Point object
        // add the new node data to the model
        var model = diagram.model;
        model.addNodeData(toData);
        // create a link data from the old node data to the new node data
        var linkdata = {};
        linkdata[model.linkFromKeyProperty] = model.getKeyForNodeData(fromData);
        linkdata[model.linkToKeyProperty] = model.getKeyForNodeData(toData);
        // and add the link data to the model
        model.addLinkData(linkdata);
        // select the new Node
        var newnode = diagram.findNodeForData(toData);
        diagram.select(newnode);
        diagram.commitTransaction("Add State");
    }

    // replace the default Link template in the linkTemplateMap
    myDiagram.linkTemplate =
        $(go.Link,  // the whole link panel
            { curve: go.Link.Bezier, toShortLength: 5,curviness: 100 },
            $(go.Shape,  // the link shape
                { stroke: "#eee", strokeWidth: 3}), //2.5//2F4F4F

            $(go.Shape,  // the arrowhead
                { toArrow: "Kite", fill: "#eee", stroke: "#eee", scale: 1.5 }),
        $(go.TextBlock,{margin: new go.Margin(0, 0, 80, 0),"stroke":"darkblue"},
        new go.Binding("text", "time")));

    myDiagram.linkTemplateMap.add("Comment",
        $(go.Link, { selectable: true },
            $(go.Shape, { strokeWidth: 2, stroke: "darkgreen" })));


    var palette =
        $(go.Palette, "myPaletteDiv",  // create a new Palette in the HTML DIV element
            {
                // share the template map with the Palette
                nodeTemplateMap: myDiagram.nodeTemplateMap,
                autoScale: go.Diagram.Uniform  // everything always fits in viewport
            });

    palette.model.nodeDataArray = [
        { category: "Source" },
        {}, // default node
        { category: "DesiredEvent" },
        { category: "UndesiredEvent", reasonsList: [{}] },
        { category: "Comment" }
    ];

    // read in the JSON-format data from the "mySavedModel" element
    await load();
    layout();
}

function layout() {
    myDiagram.layoutDiagram(true);
}

// Show the diagram's model in JSON format
function save() {
    document.getElementById("mySavedModel").value = myDiagram.model.toJson();
    myDiagram.isModified = false;
}
async function load() {
    // myDiagram.model =
    //go.Model.fromJson(document.getElementById("mySavedModel").value);
    // nodeDataArray =

        // go.GraphLinksModel(nodeDataArray, linkDataArray);
    let realnodeDataArray =
        [
            { key: 0, text: 'Impressions',layer:0, freq:  "A" ,color: goodColors[Math.floor(Math.random() * goodColors.length)] },
            { key: 1, text: 'Views', layer:1, freq: "B",color: goodColors[Math.floor(Math.random() * goodColors.length)]  },
            { key: 2, text: 'Eligibility', layer:2,freq: "C" ,color: goodColors[Math.floor(Math.random() * goodColors.length)] },
            { key: 3, text: 'Terms and Condition', layer:2,freq: "D" ,color: goodColors[Math.floor(Math.random() * goodColors.length)]},
            { key: 4, text: 'Bookmark', layer:2,freq: "E" ,color: goodColors[Math.floor(Math.random() * goodColors.length)]},
            { key: 5, text: 'Brochure Download', layer:6,freq: "F" ,color: goodColors[Math.floor(Math.random() * goodColors.length)]},
            { key: 6, text: 'Application', layer:3,freq: "G" ,color: goodColors[Math.floor(Math.random() * goodColors.length)]},
            { key: 7, text: 'Partial Filled', layer:3,freq: "H" ,color: goodColors[Math.floor(Math.random() * goodColors.length)]},
            { key: 8, text: 'Application Submitted', layer:4,freq: "I" ,color: goodColors[Math.floor(Math.random() * goodColors.length)]},
            { key: 9, text: 'Notification Push', layer:6,freq: "J" ,color: goodColors[Math.floor(Math.random() * goodColors.length)]},
            { key: 10, text: 'Sponser Website', layer:6,freq: "K" ,color: goodColors[Math.floor(Math.random() * goodColors.length)]},
            { key: 11, text: 'Follow Up Enquiry', layer:6,freq:"L" ,color: goodColors[Math.floor(Math.random() * goodColors.length)]},
            { key: 12, text: 'Follow Up Email', layer:6,freq: "M" ,color: goodColors[Math.floor(Math.random() * goodColors.length)]},
            { key: 13, text: 'Upload Documents', layer:5,freq: "N" ,color: goodColors[Math.floor(Math.random() * goodColors.length)]},
            { key: 14, text: 'Email Verified', layer:7,freq: "O" ,color: goodColors[Math.floor(Math.random() * goodColors.length)]},
            { key: 15, text: 'Phone Verified', layer:7,freq: "P" ,color: goodColors[Math.floor(Math.random() * goodColors.length)]},




        ]

    let nodeResult = await fetch("http://localhost:3001/api/nodes")
    let nodeDataArray = await nodeResult.json();
    console.log(nodeDataArray)

    nodeDataArray.forEach((node) => {
        node.color = goodColors[Math.floor(Math.random() * goodColors.length)];
    });


    let result = await fetch("http://localhost:3001/api/links")
    let linkDataArray = await result.json();
    console.log(linkDataArray);

    let userResult = await fetch("http://localhost:3001/api/users")
    users = await userResult.json();
    console.log(users);







    // linkDataArray =  [
    //     {from: 0,to:1,time:5},
    //     {from:1,to:2,time:2},
    //     {from:1,to:3,time:10},
    //     {from:1,to:4,time:10},
    //     {from:4,to:9,time:12},
    //     {from:4,to:10,time:12},
    //     {from:4,to:11,time:12},
    //     {from:4,to:12,time:12},
    //     {from:4,to:5,time:12},
    //     {from:9,to:14,time:12},
    //     {from:10,to:14,time:12},
    //     {from:11,to:14,time:12},
    //     {from:12,to:14,time:12},
    //     {from:9,to:15,time:12},
    //     {from:10,to:15,time:12},
    //     {from:11,to:15,time:12},
    //     {from:12,to:15,time:12},
    //     {from:8,to:13,time:12},
    //     {from:13,to:9,time:12},
    //     {from:13,to:10,time:12},
    //     {from:13,to:11,time:12},
    //     {from:13,to:12,time:12},
    //     {from:2,to:6,time:12},
    //     {from:2,to:7,time:12},
    //     {from:3,to:6,time:12},
    //     {from:3,to:7,time:12},
    //     {from:6,to:8,time:12},
    //     {from:7,to:4,time:12},
    //
    //
    //
    //
    //         ]
    myDiagram.model = new go.GraphLinksModel(
        nodeDataArray
        ,linkDataArray
    );
}

// function highlightSelectedPath() {
//     var sel = document.getElementById("myPaths");
//     highlightPath(paths.get(sel.selectedIndex));
// }

function nodeSelectionChanged(node) {
    selectedLayer = node.ub.layer;
    console.log("Layer",selectedLayer);

    console.log(myDiagram)
      myDiagram.updateAllTargetBindings();



    console.log(node.ub);
    // TODO: update whenever changed


    // users = [
    //     [A,B,C],
    //     [A],
    //     [A,C,E],
    //     [A,B,E],
    //     [A,C,D],
    //     [A,B,E],
    //     [A,C,D],
    //     [A,B,C],
    //     [A,C,D],
    //     [A,B,C],
    //     [A,D,E],
    //     [A,C,E],
    //     [A,B],
    //     [A,B]
    //
    // ]

    states = [A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P]

    usersForThisState = []
    // loop over each key of states
    console.log(users.length);
    for (let u=0;u<users.length;u++) {
        //console.log("S")
        console.log(u,users[u],node.ub.key);
        if(users[u].includes(states[node.ub.key]))
            usersForThisState.push(u);
    }
     console.log(usersForThisState);

    addUsersToSideList(usersForThisState);

}

function addUsersToSideList(us){
    userNames = [  "Emily Johnson",  "Michael Brown",  "Avery Davis",  "Nathan Rodriguez",  "Olivia Lee",  "Ethan Martinez",  "Sophia Taylor",  "William Anderson",  "Isabella Hernandez",  "James Wilson",  "Madison Garcia",  "Alexander Thomas",  "Charlotte Clark",  "Benjamin Baker",  "Elizabeth Wright",
          "Emily Johnson",  "Michael Brown",  "Avery Davis",  "Nathan Rodriguez",  "Olivia Lee",  "Ethan Martinez",  "Sophia Taylor",  "William Anderson",  "Isabella Hernandez",  "James Wilson",  "Madison Garcia",  "Alexander Thomas",  "Charlotte Clark",  "Benjamin Baker",  "Elizabeth Wright",
,  "Emily Johnson",  "Michael Brown",  "Avery Davis",  "Nathan Rodriguez",  "Olivia Lee",  "Ethan Martinez",  "Sophia Taylor",  "William Anderson",  "Isabella Hernandez",  "James Wilson",  "Madison Garcia",  "Alexander Thomas",  "Charlotte Clark",  "Benjamin Baker",  "Elizabeth Wright",
,  "Emily Johnson",  "Michael Brown",  "Avery Davis",  "Nathan Rodriguez",  "Olivia Lee",  "Ethan Martinez",  "Sophia Taylor",  "William Anderson",  "Isabella Hernandez",  "James Wilson",  "Madison Garcia",  "Alexander Thomas",  "Charlotte Clark",  "Benjamin Baker",  "Elizabeth Wright"
]

        // repeated
    userData = [
        {
            "email": "john@example.com",
            "application_date": "2022-01-15",
            "more_than_12_cgpa": true,
            "match": "Full-time",
            "location": "New York"
        },
        {
            "email": "jane@example.com",
            "application_date": "2022-02-10",
            "more_than_12_cgpa": false,
            "match": "Part-time",
            "location": "San Francisco"
        },
        {
            "email": "peter@example.com",
            "application_date": "2022-03-03",
            "more_than_12_cgpa": true,
            "match": "Internship",
            "location": "Chicago"
        },
        {
            "email": "mary@example.com",
            "application_date": "2022-04-20",
            "more_than_12_cgpa": true,
            "match": "Full-time",
            "location": "Los Angeles"
        },
        {
            "email": "alex@example.com",
            "application_date": "2022-05-12",
            "more_than_12_cgpa": true,
            "match": "Full-time",
            "location": "Boston"
        },
        {
            "email": "sara@example.com",
            "application_date": "2022-06-08",
            "more_than_12_cgpa": false,
            "match": "Part-time",
            "location": "Seattle"
        },
        {
            "email": "david@example.com",
            "application_date": "2022-07-01",
            "more_than_12_cgpa": true,
            "match": "Internship",
            "location": "Miami"
        },
        {
            "email": "amy@example.com",
            "application_date": "2022-08-15",
            "more_than_12_cgpa": true,
            "match": "Full-time",
            "location": "Houston"
        }

        ]



    const ulbar = document.getElementById('user-sidebar');
    ulbar.innerHTML = '';
    // loop through us
    for (let i=0;i<us.length;i++) {
        const inject = "<div class=\"post-item clearfix\">\n" +
            "                                <img style=\"max-height: 100px;max-width: 100px;margin-right:20px\"\n" +
            `                                     src=\"photos/${i%11}.png\" alt=\"\">\n` +
            `                                <h4><a href=\"#\">${userNames[i]}</a></h4>\n` +
            "                                <i class=\"bi bi-whatsapp\"></i>\n" +
            "                                <i class=\"bi bi-envelope\"></i>\n" +
            "                                <i class=\"bi bi-bell\"></i>\n" +
            "                            </div>";
        ulbar.innerHTML += inject;
    }


}


window.addEventListener('DOMContentLoaded', init);
