const { client } = require('./mongo.service');
const config = require('./config.service');

var db = client.db(config.mongo_db);
var coll = db.collection(config.mongo_coll);

/**
 * Histogram of the number of requests (server load).
 * Takes into account the duration of the request.
 *
 * We take the minimum and maximum from the table and divide this interval
 * by the number of steps.
 *
 * @param {number} numSteps  Number of steps
 * @returns Array of data for the chart
 */
async function buildRequestsHistogram(numSteps) {

    var range = await findTimeRange();

    /* Print how many seconds each step takes.
     */
    let step = (range.tmax - range.tmin) / numSteps;
    console.log('-- step: ' + (step/1000).toFixed(2) + ' sec ~ ' + Math.round(step/1000/60) + ' min');

    let tzShift = 0;
    if (config.tz_shift) {
        tzShift = config.tz_shift * 3600000;
    }

    /* Count the number of requests on each interval
     */
    let result = [];
    let t1 = range.tmin;
    for (let i = 0; i < numSteps; i++) {

        /* Get number of results betwen t1 and t2.
         */
        let t2 = t1 + step;
        let match = { $and: [{ tstamp: { $gte: new Date(t1) } }, { tstamp2: { $lt: new Date(t2) } }] };
        let count = await coll.find(match).count();

        let tstamp = new Date(round(t1 + tzShift, 1000)).toISOString();
        tstamp = tstamp.substring(11, tstamp.length-5);
        result.push({
            t: tstamp,
            count: count
        });
        t1 = t2;
    }
    return result;
}

function round(x, n) {
    return Math.round(x/n)*n;
}

function floor(x, n) {
    return Math.floor(x/n)*n;
}

function ceil(x, n) {
    return Math.ceil(x/n)*n;
}

async function findTimeRange() {

    /* Find the minimum
     */
    let min = await coll.aggregate([
        { $group: { _id: null, min: { $min: "$tstamp" } } }
    ]).toArray();
    console.log('-- min:', min[0].min);
    let tmin = min[0].min.getTime();

    /* Find the maximum
     */
    let max = await coll.aggregate([
        { $group: { _id: null, max: { $max: "$tstamp" } } }
    ]).toArray();
    console.log('-- max:', max[0].max);
    let tmax = max[0].max.getTime();

    return {tmin: tmin, tmax: tmax};
}

/**
 * Histogram of the number of requests (server load).
 * Takes into account the duration of the request.
 *
 * @param {number} stepMin  Time step, min
 * @returns  Array of data for the chart
 */
async function buildAlignedHistogram(stepMin) {
    let range = await findTimeRange();
    let stepMs = stepMin * 60000;
    range.tmin = floor(range.tmin, stepMs);
    range.tmax = ceil(range.tmax, stepMs);
    let numSteps = Math.round((range.tmax - range.tmin)/stepMs);

    let tzShift = 0;
    if (config.tz_shift) {
        tzShift = config.tz_shift * 3600000;
    }

    let result = [];
    for (let i = 0; i < numSteps; i++) {
        let t1 = range.tmin + i * stepMs;
        let t2 = t1 + stepMs;
        let match = { $and: [{ tstamp: { $gte: new Date(t1) } }, { tstamp2: { $lt: new Date(t2) } }] };
        let count = await coll.find(match).count();
        let tstamp = new Date(round(t1 + tzShift, 1000)).toISOString();
        tstamp = tstamp.substring(11, tstamp.length-8);
        result.push({
            t: tstamp,
            count: count
        });
    }
    var chartDate = new Date(round(range.tmin + tzShift, 1000)).toISOString().substring(0,10);
    return { a: result, chartDate: chartDate };
}

module.exports.buildRequestsHistogram = buildRequestsHistogram;
module.exports.buildAlignedHistogram = buildAlignedHistogram;