const mysql = require("mysql2");
const pool = mysql.createPool({
    host: 'localhost',
    user: 'majo',
    database: 'leadsalesdb3',
    password: 'oto',
});
module.exports = pool.promise();
