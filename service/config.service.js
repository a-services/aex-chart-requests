const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    app_port: process.env.app_port,

    host_name: process.env.host_name,

    mongo_url: process.env.mongo_url,
    mongo_db: process.env.mongo_db,
    mongo_coll: process.env.mongo_coll
}