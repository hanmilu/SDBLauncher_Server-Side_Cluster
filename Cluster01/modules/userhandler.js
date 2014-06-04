var mysql = require('mysql');

exports.signup = function (req, res) {
    //var JsonData = req.body;

    var pool = mysql.createPool({
        host: "192.168.0.2",
        port: "4406",
        user: "clusters",
        password: "alfmvkr88",
        database: "sdb_data",
        waitForConnection: true
    });

    pool.getConnection(function (err, connection) {
        var sqlsel = "select if ( count (google_id) > 0, user_id, 0) as sameid from user_info where google_id = ?;";
        var google_id = req.param('googleid');
        connection.query(sqlsel, google_id, function (err, result) {
            //console.log(result[0].sameid);
            console.log(req.param('googleid'));
            if (Number(result[0].sameid) > 0) {
                var sqlupdate = "update user_info set device_num = ?, reg_id = ? where user_id = ?;";
                connection.query(sqlupdate, [req.param('imei'), req.param('regid'), result[0]], function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                });
            } else {
                var sql = "insert into user_info (device_num, reg_id, google_id) values (?);";
                var values = [];
                //console.log(JsonData);
                values.push(req.param('imei'), req.param('regid'), req.param('googleid'));
                //console.log(JsonData);

                connection.query(sql, [values], function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        });

    //pool.getConnection(function (err, connection) {
    //    var sqlsel = "select if ( count (google_id) > 0, user_id, 0) as sameid from user_info where google_id = ?;";
    //    var google_id = JsonData['googleid'];
    //    connection.query(sqlsel, google_id, function (err, result) {
    //        console.log(result[0].sameid);
    //        console.log(JsonData['googleid']);
    //        if (Number(result[0].sameid) > 0) {
    //            var sqlupdate = "update user_info set device_num = ?, reg_id = ? where user_id = ?;";
    //            connection.query(sqlupdate, [JsonData['imei'], JsonData['regid'], result[0]], function (err, result) {
    //                if (err) {
    //                    console.log(err);
    //                }
    //            });
    //        } else {
    //            var sql = "insert into user_info (device_num, reg_id, google_id) values (?);";
    //            var values = [];
    //            console.log(JsonData);
    //            values.push(JsonData['imei'], JsonData['regid'], JsonData['googleid']);
    //            console.log(JsonData);

    //            connection.query(sql, [values], function (err, result) {
    //                if (err) {
    //                    console.log(err);
    //                }
    //            });
    //        }
    //    });

        //var sql = "insert into user_info (device_num, reg_id, google_id) values (?);";
        //var values = [];
        //console.log(JsonData);
        //values.push(JsonData['imei'], JsonData['regid'], JsonData['googleid']);
        //console.log(JsonData);

        //connection.query(sql, [values], function (err, result) {
        //    if (err) {
        //        console.log(err);
        //    }
        //});

        connection.release();
    });
    //console.log(JsonData);
    res.end();
}