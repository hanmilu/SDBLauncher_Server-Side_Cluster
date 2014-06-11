var mysql = require('mysql');
var gcm = require('node-gcm');

exports.getPattern = function(req, res) {
    var pool = mysql.createPool({
        host: "192.168.0.2",
        port: "4406",
        user: "clusters",
        password: "alfmvkr88",
        database: "sdb_data"
    });

    console.log(req.body);

    var JsonData = req.body;
    var longitude = (JsonData.longitude + 0.000001) * 10000000;
    var latitude = (JsonData.latitude + 0.000001) * 10000000;
        
    console.log(JsonData);
    
    var x = parseInt(1272000000 - longitude) / 10000;
    var y = parseInt(376000000 - latitude) / 10000;

    var max_weight = -1;
    var min_at;
    var min_long;
    var min_lat;
    var min_num;
    var min_cat;
    var minweight;

    var cl_weight;
    var weight;
    var distance;
    var cnt;

    pool.getConnection(function (err, connection) {
        var sql = "select pattern_id from grid where grid_x >= ? and grid_x <= ? and grid_y >=? and grid_y <= ?;";
        var data = [x - 1, x + 1, y - 1, y + 1];
        var resJson = {};
        var tempJson = {};
        var tempArr = [];

        connection.query(sql, data, function (err, result) {
            if (err) {
                console.log(err);
            }
            connection.release();

            cnt = 0;
            console.log(result);

            try {
                result[0].pattern_id;
                var sql2 = "select group_pattern.*, cat_info.* from group_pattern "
                        + "inner join cat_info on group_pattern.category = cat_info.cat_id where group_pattern.pattern_id in ('" + result[0].pattern_id + "'";

                for (var i = 1; i < result.length; i++) {
                    sql2 += ",'" + result[i].pattern_id + "'";
                    cnt++;
                }
                sql2 += ");";

                connection.query(sql2, function (err, result) {
                    connection.release();

                    for (var i = 1; i < result.length; i++) {
                        distance = Math.sqrt(Math.pow(longitude - (result[i].center_longitude * 10000000), 2)
                            + Math.pow(latitude - (result[i].center_latitude * 10000000), 2));
                        cl_weight = result[i].weight;

                        weight = (10000 * cl_weight) / distance;

                        if (weight > max_weight) {
                            max_weight = weight;
                            min_at = result[i]['pattern_id'];
                            min_long = result[i]['center_longitude'];
                            min_lat = result[i]['center_latitude'];
                            min_num = result[i]['data_num'];
                            min_cat = result[i]['cat_id'];
                            min_weight = result[i]['weight'];
                        }
                    }

                    var app_cnt = 0;

                    var sql3 = "select group_application.*, app_info.* from group_application "
                            + "inner join app_info on group_application.app_id = app_info.app_id "
                            + "where group_application.pattern_id = " + min_at + " order by count desc;";
                    connection.query(sql3, function (err, result) {
                        if (err) {
                            console.log(err);
                        }
                        connection.release();

                        tempArr = [];
                        for (var i = 0; i < result.length; i++) {
                            ++app_cnt;
                            var app_name = result[i]['package'];
                            var app_count = result[i]['count'];

                            tempJson = {};
                            tempJson.app_package = app_name;
                            tempJson.app_count = app_count;

                            tempArr.push(tempJson);

                            if (app_cnt == 3) {
                                break;
                            }
                        }

                        resJson.app_info = tempArr;
                        resJson.app_cnt = app_cnt;
                        resJson.best = min_at;
                        resJson.long = min_long;
                        resJson.lat = min_lat;
                        resJson.num = min_num;
                        resJson.cat = min_cat;
                        resJson.weight = min_weight;
                        resJson.cnt = cnt;

                        res.writeHead(200, { 'content-Type': 'application/json' });
                        console.log(resJson);
                        res.end(JSON.stringify(resJson));
                    });
                });
            } catch (err) {
                if (cnt == 0) {
                    console.log("cnt : " + cnt);
                    resJson.cnt = 0;
                    res.writeHead(200, { 'content-Type': 'application/json' });
                    console.log(resJson);
                    res.end(JSON.stringify(resJson));
                }
            }
        });
    });
}

exports.singlePatternCmp = function (req, res) {

    var id = req.body.id;
    console.log(req.body);

    var message = new gcm.Message();
    var sender = new gcm.Sender('AIzaSyAcagZo44cCppJyvl_ZYVSwI7hlpTCOXD8');
    var registrationIds = [];

    // Optional
    //message.
    //message.collapseKey = 'demo';
    message.addDataWithObject({
        "userid": id,
        "discription": "SINGLE_PATTERN_COMPLETE"
    });
    message.delayWhileIdle = true;
    message.timeToLive = 3;

    var connection = mysql.createConnection({
        host: "192.168.0.2",
        port: "4406",
        user: "clusters",
        password: "alfmvkr88",
        database: "sdb_data"
    });

    connection.connect(function (err) {
        if (err) {
        } else {
            connection.query("select reg_id from user_info where user_id = ?", id, function (err, result) {
                //registrationIds = result;
                var temp = result[0]['reg_id'].replace("\'", "");
                temp = temp.replace("\'", "");
                registrationIds.push(temp);

                console.log("reg : ");
                console.log(registrationIds);
                console.log("res : ");
                sender.send(message, registrationIds, 4, function (err, result) {
                    console.log(result);
                });
                res.end();
            });
        }
    });
}

exports.singlePattern = function (req, res) {
    var id = req.body.id;

    var connection = mysql.createConnection({
        host: "192.168.0.2",
        port: "4406",
        user: "clusters",
        password: "alfmvkr88",
        database: "sdb_data"
    });

    connection.connect(function (err) {
        if (err) {
        } else {
            connection.query("select * from single_pattern where user_id = ?", id, function (err, result) {
                
                res.writeHead(200, { 'content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            });
        }
    });
}

exports.singleApplication = function (req, res) {
    var id = req.body.id;

    var parm = [];
    var resobj = {};
    var resArr = [];

    var connection = mysql.createConnection({
        host: "192.168.0.2",
        port: "4406",
        user: "clusters",
        password: "alfmvkr88",
        database: "sdb_data"
    });

    connection.connect(function (err) {
        if (err) {
        } else {
            connection.query("select pattern_id from single_pattern where user_id = ?;", id, function (err, result) {
                for (var i = 0; i < result.length; i++) {
                    parm.push(result[i]['pattern_id']);
                }
                connection.query("select pattern_id, mode, count, app_name, package, category from single_application inner join app_info on single_application.app_id = app_info.app_id where pattern_id in (?) order by pattern_id, count;", [parm], function (err, result) {
                    res.writeHead(200, { 'content-Type': 'application/json' });
                    res.end(JSON.stringify(result));
                });
            });
        }
    });
}