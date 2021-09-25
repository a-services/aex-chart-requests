const config = require('../service/config.service');
const { client, close } = require('../service/mongo.service');
const chart = require('../service/requestChart.service');

//chart.findGaps()
testHisto();
//testConfig();
//testMongo();

function testMongo() {
    // "mongodb": "^4.1.2",
    console.log(client);
}

function testConfig() {
    console.log(config.mongo_db);
    console.log(config.mongo_coll);
}

function testHisto() {
    chart.buildRequestsHistogram(10)
        .then(function success(result) {
            console.log('-- success:', result);
            close();
        }, function error(e) {
            console.log('-- error:', e);
            close();
        });
}