var express = require('express');
const {nodesData,users} = require("../gen");
var router = express.Router();

router.get('/api/users',(req, res) => {
  return res.send(
      JSON.stringify(users)
  );
});

router.get('/api/nodes',(req, res) => {
  return res.send(
      JSON.stringify(nodesData)
  );
});


router.get('/api/links',(req, res) => {
  let linkDataArray =  [
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
    console.log()

  res.send(
      JSON.stringify(linkDataArray)
  );
})



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
