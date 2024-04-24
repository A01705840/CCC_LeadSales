const mysql = require("mysql2");
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'majo',
    database: 'leadsalesdb3',
    password: 'oto',
});
module.exports = pool.promise();
