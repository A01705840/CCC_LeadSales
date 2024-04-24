const mysql = require("mysql2");
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'leadsalesdb3',
    password: '',
});
module.exports = pool.promise();
