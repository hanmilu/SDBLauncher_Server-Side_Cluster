var mysql = require('mysql');
var request = require('request');
var gcm = require('node-gcm');

exports.collect = function(req, res) {
    var JsonData = req.body;
    var useridFromDB;

    console.log("init DB Connection");
    var pool = mysql.createPool({
            host : "123.228.65.104",
            port : "4406",
            user : "clusters",
            password : "alfmvkr88",
            database : "sdb_data",
            multipleStatements : true,
            waitForConnection : true
        });
    console.log("init DB Connection Complete");

    console.log("Find Userid");
    pool.getConnection(function(err, connection){
        var sql = "select user_id from user_info where device_num = ?;";
        var devNum = JsonData.userid;

        connection.query(sql, devNum, function(err, result){
            if (err){
                console.log(err);
            }

            console.log(result[0]['user_id']);
            if (result[0]['user_id'] == null) {
                console.log("Cannot find user_id from DB");
            }else{
                console.log("Success to find userid from DB");
                useridFromDB = result[0]['user_id'];
                
                sql = "insert into data (user_id, longitude, latitude, mode, category, application, time) values (?);";
                var values = [];
                for (var i = 0; i < JsonData.data.length; i++) {
                    values.push([Number(useridFromDB), Number(JsonData.data[i].longitude), Number(JsonData.data[i].latitude),
                        Number(JsonData.data[i].nowMode), Number(JsonData.data[i].category),
                        JsonData.data[i].appName, Number(JsonData.data[i].timestamp)]);
                }
                if(err) {
                    console.log(err);
                }
                for (var i = 0; i < JsonData.data.length; i++) {
                    connection.query(sql, [values[i]], function(err, result){
                        if (err) {
                            console.log(err);
                            connection.release();

                            res.writeHead(200, {'content-Type' : 'text/plain'});
	                        res.end('res');
                        }
                        if(i == JsonData.data.length) {
                            res.writeHead(200, {'content-Type' : 'text/plain'});
	                        res.end('res');
                        }
                    });
                }
            }

        });
        connection.release();
    });
}

exports.GetAppData = function (req, res) {
    var JsonData = req.body;
    var id = JsonData.id;

    var pool = mysql.createPool({
        host: "123.228.65.104",
        port: "4406",
        user: "clusters",
        password: "alfmvkr88",
        database: "sdb_data",
        charset: "euckr_korean_ci"
    });

    pool.getConnection(function (err, connection) {
        var sql = "select if ( count ( app_id ) = 0, ?, app_id) as res from app_info where package = ?;";
        var token1 = '&access_token=e994786184258a89cdfc7a4b8307502408a978bf';
        var token2 = '&access_token=aef684eb0f1b2d7d7983d0c81ac12685a96b8da5';
        var cnt = 0;

        for (var i = 0; i < JsonData.appdata.length; i++) {
            //connection.query(sql, function (err, result) {
            connection.query(sql, [JsonData.appdata[i].packagename, JsonData.appdata[i].packagename], function (err, result) {
                if (err) {
                    console.log(err);
                }
                connection.release();

                //console.log(result[0].res);
                //console.log(isNaN(result[0].res));

                if (isNaN(result[0].res)) {
                    console.log("request " + result[0].res);
                    request.get('https://42matters.com/api/1/apps/lookup.json?p=' + result[0].res + token2,
                        function (err, res, body) {
                            if (err) {
                                console.log(err);
                            } else {
                                if (res.statusCode == 404) { // cannot find app information on the market
                                    var sql4 = "insert into app_info (app_name, category, package) values (?);";
                                    var data2 = [];

                                    var appJson = JSON.parse(res.body);

                                    //console.log(appJson.title);

                                    data2.push(['Not Found', '0', result[0].res]);
                                    //console.log(data2);

                                    connection.query(sql4, data2, function (err, result) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        cnt++;
                                        if (cnt == JsonData.appdata.length) {
                                            notyAppDataUpdateComp(id);
                                        }
                                        connection.release();
                                    });
                                } else if (res.statusCode == 403) { // api request limit
                                    token1 = token2;
                                    cnt++;
                                    if (cnt == JsonData.appdata.length) {
                                        notyAppDataUpdateComp(id);
                                    }
                                } else { // append appdata to db
                                    var sql2 = "insert into app_info (app_name, category, package) values (?);";
                                    var data = [];

                                    var appJson = JSON.parse(res.body);

                                    //console.log(appJson.title);

                                    data.push([appJson.title, Number(appJson.cat_int), appJson.package_name]);
                                    //console.log(data);

                                    connection.query(sql2, data, function (err, result) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        cnt++;
                                        if (cnt == JsonData.appdata.length) {
                                            notyAppDataUpdateComp(id);
                                        }
                                        connection.release();
                                    });
                                }
                            }
                        });
                } else {
                    var sql3 = "select * from app_info where app_id = ?;";

                    connection.query(sql3, result[0].res, function (err, result) {
                        if (err) {
                            console.log(err);
                        }
                        cnt++;
                        if (cnt == JsonData.appdata.length) {
                            notyAppDataUpdateComp(id);
                        }
                        connection.release();
                    });
                }
            });
        }
    });

    res.writeHead(200, { 'content-Type': 'text/plain' });
    res.end("processing");
}

notyAppDataUpdateComp = function (id) {

    var message = new gcm.Message();
    var sender = new gcm.Sender('AIzaSyAcagZo44cCppJyvl_ZYVSwI7hlpTCOXD8');
    var registrationIds = [];

    var connection = mysql.createConnection({
        host: "123.228.65.104",
        port: "4406",
        user: "clusters",
        password: "alfmvkr88",
        database: "sdb_data"
    });

    message.addDataWithObject({
        "discription": "APPDATA_UPDATE_COMPLETE"
    });
    message.delayWhileIdle = true;
    message.timeToLive = 3;

    connection.connect(function (err) {
        if (err) {
        } else {
            connection.query("select reg_id from user_info where user_id = ?", id, function (err, result) {
                //registrationIds = result;
                if (err) {
                    console.log(err);
                }

                var temp = result[0]['reg_id'].replace("\'", "");
                temp = temp.replace("\'", "");
                registrationIds.push(temp);

                console.log("reg : ");
                console.log(registrationIds);
                console.log("res : ");
                sender.send(message, registrationIds, 4, function (err, result) {
                    console.log(result);
                });
            });
        }
    });
}

exports.GetCategory = function(req, res) {
    console.log(req.body);

    var JsonData = req.body;

    var pool = mysql.createPool({
            host : "123.228.65.104",
            port : "4406",
            user : "clusters",
            password : "alfmvkr88",
            database : "sdb_data",
            charset: "euckr_korean_ci"
        });

    pool.getConnection(function (err, connection) {
        var sql = "select * from app_info where package in (";
        var data = [];
        var str = "";

        str += "'" + JsonData.appdata[0].packagename + "'";
        for (var i = 1; i < JsonData.appdata.length; i++) {
            str += ",'" + JsonData.appdata[i].packagename + "'";
            data.push(JsonData.appdata[i].packagename);
        }

        sql += str + ")";
        connection.query(sql, function (err, result) {
            if (err) {
                console.log(err);
            }

            connection.release();

            res.charset = 'euckr_korean_ci';
            res.writeHead(200, { 'content-Type': 'application/json', 'content-encoding': 'euckr', 'content-language': 'ko' });
            console.log(result);
            res.end(JSON.stringify(result));
        });
    });
}