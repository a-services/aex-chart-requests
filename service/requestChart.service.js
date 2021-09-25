const { client } = require('./mongo.service');
const config = require('./config.service');

var db = client.db(config.mongo_db);

/**
 * Histogram of the number of requests (server load).
 * @param {number} numSteps  Number of steps
 * @returns Array of data
 */
async function buildRequestsHistogram(numSteps) {
    let coll = db.collection(config.mongo_coll);

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

    let step = (tmax - tmin) / numSteps;
    console.log('-- step: ' + (step/1000).toFixed(2) + ' sec ~ ' + Math.round(step/1000/60) + ' min');

    /* Count the number of requests on each interval
     */
    let result = [];
    let t1 = tmin;
    for (let i = 0; i < numSteps; i++) {
        let t2 = t1 + step;
        let match = { $and: [{ tstamp: { $gte: new Date(t1) } }, { tstamp: { $lt: new Date(t2) } }] };

        let count = await coll.find(match).count();

        result.push({
            t: new Date(t1).toISOString(),
            count: count
        });
        t1 = t2;
    }
    return result;
}

module.exports.buildRequestsHistogram = buildRequestsHistogram;