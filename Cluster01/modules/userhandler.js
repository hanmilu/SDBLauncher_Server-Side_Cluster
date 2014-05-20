var mysql = require('mysql');

exports.signup = function (req, res) {
    var JsonData = req.body;

    var pool = mysql.createPool({
        host: "123.228.65.104",
        port: "4406",
        user: "clusters",
        password: "alfmvkr88",
        database: "sdb_data",
        multipleStatements: true,
        waitForConnection: true
    });

    pool.getConnection(function (err, connection) {
        var sql = "insert into user_info (device_num, reg_id, google_id) values (?);";
        var values = [];
        console.log(JsonData);
        values.push(JsonData['imei'], JsonData['regid'], JsonData['googleid']);
        console.log(JsonData);

        connection.query(sql, [values], function (err, result) {
            if (err) {
                console.log(err);
            }
        });

        connection.release();
    });
    console.log(JsonData);
    res.end();
}