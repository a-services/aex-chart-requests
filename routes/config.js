var express = require('express');
var router = express.Router();
var config = require('../service/config.service')

router.get('/', function(req, res, next) {
    res.send(config);
});

module.exports = router;