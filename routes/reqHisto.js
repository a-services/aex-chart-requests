var express = require('express');
var router = express.Router();
var requestChart = require('../service/requestChart.service')

/* Histogram of the number of requests (server load).
 */
router.get('/', function(req, res, next) {
    var numSteps = parseInt(req.query.n);
    requestChart.buildRequestsHistogram(numSteps).then(result => {
        res.send(result);
    });
});

module.exports = router;