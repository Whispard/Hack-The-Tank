A = "A"
B = "B"
C = "C"
D = "D"
E = "E"
F = "F"
G = "G"
H = "H"
I = "I"
J = "J"
K = "K"
L = "L"
M = "M"
N = "N"
O = "O"
P = "P"



dpds = {
    A: [],
    B: [A],
    C: [A],

}

states = {
    A: 'Impressions',
    B: "Views",
    C: "Eligibility",
    D: "Terms and Condition",
    E: "Bookmark",
    F: "Brochure Download",
    G: "Application",
    H: "Partial Filled",
    I: "Application Submitted",
    J: "Notification Push",
    K: "Sponser Website",
    L: "Follow Up Enquiry",
    M: "Follow Up Email",
    N: "Upload Documents",
    O: "Email Verified",
    P: "Phone Verified",
}
stateLayers = [0,1,2,2,2,6,3,3,4,6,6,6,6,5,7,7]

users = [
    [A,B,C,G,I,N,K,O],
    [A,B,C,G,I,N,K,O],
    [A,B,C,G,I,N,K,O],
    [A,B,C,H,E,L,P],
    [A,B,C,H,E,L,P],
    [A,B,D,G,I,N,J,O],
    [A,B,D,G,I,N,J,O],
    [A,B,D,G,I,N,J,O],
    [A,B,D,G,I,N,J,O],
    [A,B,D,G,I,N,J,P],
    [A,B,D,G,I,N,J,P],
    [A,B,D,G,I,N,J,P],
    [A,B,D,G,I,N,J,P],
    [A,B,E,L,P],
    [A,B,D,E,F],
    [A,B,C,G,I,N,K,P],
    [A,B],
    [A,B,C],
    [A,B,D],
    [A,B,C,G],
    [A,B,D,H],
    [A,B,C,G,I],
    [A,B],
    [A,B,C],
    [A,B,D],
    [A,B,C,G],
    [A,B,D,H],
    [A,B,C,G,I],
    [A,B,D,H,I],
    [A,B,C,G,I,N],
    [A,B,D,H,I,N],
    [A,B,C,H,E],
    [A,B,D,H,E],
    [A,B,D,H,E,M],
    [A,B,D,H,E,M],
    [A,B,D,H,E,M],
    [A,B,D,H,E,M],
    [A,B,D,H,E,M],
    [A,B,D,H,E,M],
    [A,B,C,G,I,N,J],
    [A,B,D,H,I,N,K],
    [A,B,C,G,I,N],
    [A,B,D,H,I,N],
    [A,B,C,H,E],
    [A,B,D,H,E],
    [A,B,C,G,I,N,J],
    [A,B,D,H,I,N,K],
    [A,B,C,G,I,N],
    [A,B,D,H,I,N],
    [A,B,C,H,E],
    [A,B,D,H,E],
    [A,B,C,G,I,N,J],
    [A,B,D,H,I,N,K],
    [A,B,C,H,E,J],
    [A,B,D,H,E,K],
    [A,B,C,G,I,N,L],
    [A,B,D,H,I,N,M],
    [A,B,C,H,E,L],
    [A,B,D,H,E,M],
    [A,B,D,H,I,N,F],
    [A],
    [A],
    [A],
    [A],

]

links = {}

for (const s in states) {
    links[s] = {}
    // loop over each key of states
    for (let u = 0; u < users.length; u++) {
        links[s][u] = 0;
    }
}

for (let u = 0; u < users.length; u++) {
    // add all of states of each user to links
    for (let i = 0; i < users[u].length; i++) {
        links[users[u][i]][u] = 1;
        // add dependencies
        // state is users[u][i]
        //const addForState = users[u][i]
        //for(const dep in dpds[addForState]){
        //    console.log(dep)
        //    links[dpds[addForState][dep]][u] = 1;
        //
        // }
    }
}


// print whole links
for (const s in states) {

    // loop over each key of states
    for (let u = 0; u < users.length; u++) {
        if (links[s][u] > 0)
            console.log(`User: ${u + 1}, State: ${states[s]}`, links[s][u])
    }
}

nodesData = []
linksData = []
for (let i = 0; i < Object.keys(states).length; i++) {
    s = Object.keys(states)[i];
    countsOfState = Object.keys(links[s]).filter(x => links[s][x] === 1).length;
    console.log(`State: ${states[s]}:`, countsOfState);
    nodesData[i] = {key: i, text: states[s], freq: countsOfState,layer: stateLayers[i]};
}

module.exports = {
    nodesData,
    users
}

// iterate in 2d array links
// for (const s in states) {
//     for(const u in users){
//         if (links[s][u] > 0){
//             linksData[s] = u;
//         }
//     }
// }
console.log(nodesData)
linkDataArray =  [
    {from: 0,to:1,time:5},
    {from:1,to:2,time:2},
    {from:1,to:3,time:23},
    {from:1,to:4,time:4},
    {from:4,to:9,time:8},
    {from:4,to:10,time:10},
    {from:4,to:11,time:15},
    {from:4,to:12,time:2},
    {from:4,to:5,time:5},
    {from:9,to:14,time:3},
    {from:10,to:14,time:7},
    {from:11,to:14,time:10},
    {from:12,to:14,time:13},
    {from:9,to:15,time:10},
    {from:10,to:15,time:9},
    {from:11,to:15,time:8},
    {from:12,to:15,time:6},
    {from:8,to:13,time:11},
    {from:13,to:9,time:5},
    {from:13,to:10,time:4},
    {from:13,to:11,time:7},
    {from:13,to:12,time:2},
    {from:2,to:6,time:10},
    {from:2,to:7,time:11},
    {from:3,to:6,time:12},
    {from:3,to:7,time:10},
    {from:6,to:8,time:10},
    {from:7,to:4,time:9},
]

