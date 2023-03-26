function init() {

    // Since 2.2 you can also author concise templates with method chaining instead of GraphObject.make
    // For details, see https://gojs.net/latest/intro/buildingObjects.html
    const $ = go.GraphObject.make;  // for conciseness in defining templates

    myDiagram =
        $(go.Diagram, "myDiagramDiv",  // must be the ID or reference to div
            {
                initialAutoScale: go.Diagram.UniformToFill,
                layout: $(go.TreeLayout,
                    { comparer: go.LayoutVertex.smartComparer }) // have the comparer sort by numbers as well as letters
                // other properties are set by the layout function, defined below
            });

    // define the Node template
    myDiagram.nodeTemplate =
        $(go.Node, "Spot",
            { locationSpot: go.Spot.Center },
            new go.Binding("text", "text"),  // for sorting
            $(go.Shape, "Ellipse",
                {
                    fill: "lightgray",  // the initial value, but data binding may provide different value
                    stroke: null,
                    desiredSize: new go.Size(30, 30)
                },
                new go.Binding("desiredSize", "size"),
                new go.Binding("fill", "fill")),
            $(go.TextBlock,
                new go.Binding("text", "text"))
        );

    // define the Link template
    myDiagram.linkTemplate =
        $(go.Link,
            {
                routing: go.Link.Orthogonal,
                selectable: false
            },
            $(go.Shape,
                { strokeWidth: 3, stroke: "#333" }));

    // generate a tree with the default values
    rebuildGraph();
}

function rebuildGraph() {
    var minNodes = document.getElementById("minNodes").value;
    minNodes = parseInt(minNodes, 10);

    var maxNodes = document.getElementById("maxNodes").value;
    maxNodes = parseInt(maxNodes, 10);

    var minChil = document.getElementById("minChil").value;
    minChil = parseInt(minChil, 10);

    var maxChil = document.getElementById("maxChil").value;
    maxChil = parseInt(maxChil, 10);

    var hasRandomSizes = document.getElementById("randomSizes").checked;

    // create and assign a new model
    var nodeDataArray = generateNodeData(minNodes, maxNodes, minChil, maxChil, hasRandomSizes);
    myDiagram.model = new go.TreeModel(nodeDataArray);

    // update the diagram layout customized by the various control values
    layout();
}

// Creates a random number (between MIN and MAX) of randomly colored nodes.
function generateNodeData(minNodes, maxNodes, minChil, maxChil, hasRandomSizes) {
    var nodeArray = [];
    if (minNodes === undefined || isNaN(minNodes) || minNodes < 1) minNodes = 1;
    if (maxNodes === undefined || isNaN(maxNodes) || maxNodes < minNodes) maxNodes = minNodes;

    // Create a bunch of node data
    var numNodes = Math.floor(Math.random() * (maxNodes - minNodes + 1)) + minNodes;
    for (var i = 0; i < numNodes; i++) {
        nodeArray.push({
            key: i,  // the unique identifier
            // "parent" is set by code below that assigns children
            text: i.toString(),  // some text to be shown by the node template
            fill: go.Brush.randomColor(),  // a color to be shown by the node template
            size: (hasRandomSizes) ? new go.Size(Math.random() * 50 + 20, Math.random() * 50 + 20) : new go.Size(30, 30)
        });
    }

    // Randomize the node data
    for (i = 0; i < nodeArray.length; i++) {
        var swap = Math.floor(Math.random() * nodeArray.length);
        var temp = nodeArray[swap];
        nodeArray[swap] = nodeArray[i];
        nodeArray[i] = temp;
    }

    // Takes the random collection of node data and creates a random tree with them.
    // Respects the minimum and maximum number of links from each node.
    // The minimum can be disregarded if we run out of nodes to link to.
    if (nodeArray.length > 1) {
        if (minChil === undefined || isNaN(minChil) || minChil < 0) minChil = 0;
        if (maxChil === undefined || isNaN(maxChil) || maxChil < minChil) maxChil = minChil;

        // keep the Set of node data that do not yet have a parent
        var available = new go.Set();
        available.addAll(nodeArray);
        for (var i = 0; i < nodeArray.length; i++) {
            var parent = nodeArray[i];
            available.remove(parent);

            // assign some number of node data as children of this parent node data
            var children = Math.floor(Math.random() * (maxChil - minChil + 1)) + minChil;
            for (var j = 0; j < children; j++) {
                var child = available.first();
                if (child === null) break;  // oops, ran out already
                available.remove(child);
                // have the child node data refer to the parent node data by its key
                child.parent = parent.key;
            }
            if (available.count === 0) break;  // nothing left?
        }
    }
    console.log(nodeArray)
    return nodeArray;
}

// Update the layout from the controls, and then perform the layout again
function layout() {
    myDiagram.startTransaction("change Layout");
    var lay = myDiagram.layout;

    var style = document.getElementById("style").value;
    if (style === "Layered") lay.treeStyle = go.TreeLayout.StyleLayered;
    else if (style === "Alternating") lay.treeStyle = go.TreeLayout.StyleAlternating;
    else if (style === "LastParents") lay.treeStyle = go.TreeLayout.StyleLastParents;
    else if (style === "RootOnly") lay.treeStyle = go.TreeLayout.StyleRootOnly;

    var layerStyle = document.getElementById("layerStyle").value;
    if (layerStyle === "Individual") lay.layerStyle = go.TreeLayout.LayerIndividual;
    else if (layerStyle === "Siblings") lay.layerStyle = go.TreeLayout.LayerSiblings;
    else if (layerStyle === "Uniform") lay.layerStyle = go.TreeLayout.LayerUniform;

    var angle = getRadioValue("angle");
    angle = parseFloat(angle, 10);
    lay.angle = angle;

    var align = document.getElementById("align").value;
    if (align === "CenterChildren") lay.alignment = go.TreeLayout.AlignmentCenterChildren;
    else if (align === "CenterSubtrees") lay.alignment = go.TreeLayout.AlignmentCenterSubtrees;
    else if (align === "Start") lay.alignment = go.TreeLayout.AlignmentStart;
    else if (align === "End") lay.alignment = go.TreeLayout.AlignmentEnd;
    else if (align === "Bus") lay.alignment = go.TreeLayout.AlignmentBus;
    else if (align === "BusBranching") lay.alignment = go.TreeLayout.AlignmentBusBranching;
    else if (align === "TopLeftBus") lay.alignment = go.TreeLayout.AlignmentTopLeftBus;
    else if (align === "BottomRightBus") lay.alignment = go.TreeLayout.AlignmentBottomRightBus;

    var nodeSpacing = document.getElementById("nodeSpacing").value;
    nodeSpacing = parseFloat(nodeSpacing, 10);
    lay.nodeSpacing = nodeSpacing;

    var nodeIndent = document.getElementById("nodeIndent").value;
    nodeIndent = parseFloat(nodeIndent, 10);
    lay.nodeIndent = nodeIndent;

    var nodeIndentPastParent = document.getElementById("nodeIndentPastParent").value;
    nodeIndentPastParent = parseFloat(nodeIndentPastParent, 10);
    lay.nodeIndentPastParent = nodeIndentPastParent;

    var layerSpacing = document.getElementById("layerSpacing").value;
    layerSpacing = parseFloat(layerSpacing, 10);
    lay.layerSpacing = layerSpacing;

    var layerSpacingParentOverlap = document.getElementById("layerSpacingParentOverlap").value;
    layerSpacingParentOverlap = parseFloat(layerSpacingParentOverlap, 10);
    lay.layerSpacingParentOverlap = layerSpacingParentOverlap;

    var sorting = document.getElementById("sorting").value;
    if (sorting === "Forwards") lay.sorting = go.TreeLayout.SortingForwards;
    else if (sorting === "Reverse") lay.sorting = go.TreeLayout.SortingReverse;
    else if (sorting === "Ascending") lay.sorting = go.TreeLayout.SortingAscending;
    else if (sorting === "Descending") lay.sorting = go.TreeLayout.SortingDescending;

    var compaction = getRadioValue("compaction");
    if (compaction === "Block") lay.compaction = go.TreeLayout.CompactionBlock;
    else if (compaction === "None") lay.compaction = go.TreeLayout.CompactionNone;

    var breadthLimit = document.getElementById("breadthLimit").value;
    breadthLimit = parseFloat(breadthLimit, 10);
    lay.breadthLimit = breadthLimit;

    var rowSpacing = document.getElementById("rowSpacing").value;
    rowSpacing = parseFloat(rowSpacing, 10);
    lay.rowSpacing = rowSpacing;

    var rowIndent = document.getElementById("rowIndent").value;
    rowIndent = parseFloat(rowIndent, 10);
    lay.rowIndent = rowIndent;

    var setsPortSpot = document.getElementById("setsPortSpot").checked;
    lay.setsPortSpot = setsPortSpot;

    var setsChildPortSpot = document.getElementById("setsChildPortSpot").checked;
    lay.setsChildPortSpot = setsChildPortSpot;

    if (style !== "Layered") {
        var altAngle = getRadioValue("altAngle");
        altAngle = parseFloat(altAngle, 10);
        lay.alternateAngle = altAngle;

        var altAlign = document.getElementById("altAlign").value;
        if (altAlign === "CenterChildren") lay.alternateAlignment = go.TreeLayout.AlignmentCenterChildren;
        else if (altAlign === "CenterSubtrees") lay.alternateAlignment = go.TreeLayout.AlignmentCenterSubtrees;
        else if (altAlign === "Start") lay.alternateAlignment = go.TreeLayout.AlignmentStart;
        else if (altAlign === "End") lay.alternateAlignment = go.TreeLayout.AlignmentEnd;
        else if (altAlign === "Bus") lay.alternateAlignment = go.TreeLayout.AlignmentBus;
        else if (altAlign === "BusBranching") lay.alternateAlignment = go.TreeLayout.AlignmentBusBranching;
        else if (altAlign === "TopLeftBus") lay.alternateAlignment = go.TreeLayout.AlignmentTopLeftBus;
        else if (altAlign === "BottomRightBus") lay.alternateAlignment = go.TreeLayout.AlignmentBottomRightBus;

        var altNodeSpacing = document.getElementById("altNodeSpacing").value;
        altNodeSpacing = parseFloat(altNodeSpacing, 10);
        lay.alternateNodeSpacing = altNodeSpacing;

        var altNodeIndent = document.getElementById("altNodeIndent").value;
        altNodeIndent = parseFloat(altNodeIndent, 10);
        lay.alternateNodeIndent = altNodeIndent;

        var altNodeIndentPastParent = document.getElementById("altNodeIndentPastParent").value;
        altNodeIndentPastParent = parseFloat(altNodeIndentPastParent, 10);
        lay.alternateNodeIndentPastParent = altNodeIndentPastParent;

        var altLayerSpacing = document.getElementById("altLayerSpacing").value;
        altLayerSpacing = parseFloat(altLayerSpacing, 10);
        lay.alternateLayerSpacing = altLayerSpacing;

        var altLayerSpacingParentOverlap = document.getElementById("altLayerSpacingParentOverlap").value;
        altLayerSpacingParentOverlap = parseFloat(altLayerSpacingParentOverlap, 10);
        lay.alternateLayerSpacingParentOverlap = altLayerSpacingParentOverlap;

        var altSorting = document.getElementById("altSorting").value;
        if (altSorting === "Forwards") lay.alternateSorting = go.TreeLayout.SortingForwards;
        else if (altSorting === "Reverse") lay.alternateSorting = go.TreeLayout.SortingReverse;
        else if (altSorting === "Ascending") lay.alternateSorting = go.TreeLayout.SortingAscending;
        else if (altSorting === "Descending") lay.alternateSorting = go.TreeLayout.SortingDescending;

        var altCompaction = getRadioValue("altCompaction");
        if (altCompaction === "Block") lay.alternateCompaction = go.TreeLayout.CompactionBlock;
        else if (altCompaction === "None") lay.alternateCompaction = go.TreeLayout.CompactionNone;

        var altBreadthLimit = document.getElementById("altBreadthLimit").value;
        altBreadthLimit = parseFloat(altBreadthLimit, 10);
        lay.alternateBreadthLimit = altBreadthLimit;

        var altRowSpacing = document.getElementById("altRowSpacing").value;
        altRowSpacing = parseFloat(altRowSpacing, 10);
        lay.alternateRowSpacing = altRowSpacing;

        var altRowIndent = document.getElementById("altRowIndent").value;
        altRowIndent = parseFloat(altRowIndent, 10);
        lay.alternateRowIndent = altRowIndent;

        var altSetsPortSpot = document.getElementById("altSetsPortSpot").checked;
        lay.alternateSetsPortSpot = altSetsPortSpot;

        var altSetsChildPortSpot = document.getElementById("altSetsChildPortSpot").checked;
        lay.alternateSetsChildPortSpot = altSetsChildPortSpot;
    }

    myDiagram.commitTransaction("change Layout");
}

function getRadioValue(name) {
    var radio = document.getElementsByName(name);
    for (var i = 0; i < radio.length; i++)
        if (radio[i].checked) return radio[i].value;
}
window.addEventListener('DOMContentLoaded', init);
