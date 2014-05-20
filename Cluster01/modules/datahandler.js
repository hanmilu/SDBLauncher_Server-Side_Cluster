var mysql = require('mysql');
var request = require('request');

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

    var pool = mysql.createPool({
        host: "123.228.65.104",
        port: "4406",
        user: "clusters",
        password: "alfmvkr88",
        database: "sdb_data",
        charset: "euckr_korean_ci"
    });

    pool.getConnection(function (err, connection) {
        var sql = "select if ( count ( app_id ) = 0, ?, 0) as res from app_info where package = ?;";

        for (var i = 0; i < JsonData.appdata.length; i++) {
            //connection.query(sql, function (err, result) {
            connection.query(sql, [JsonData.appdata[i].packagename, JsonData.appdata[i].packagename], function (err, result) {
                if (err) {
                    console.log(err);
                }

                if (result[0].res != 0) {
                    console.log("request " + result[0].res);
                    request.get('https://42matters.com/api/1/apps/lookup.json?p=' + result[0].res + ' + &access_token=e994786184258a89cdfc7a4b8307502408a978bf',
                        function (err, res, body) {
                            if (err) {
                                console.log(err);
                            } else {
                                if (res.statusCode == 404) { // cannot find app information on the market
                                } else if (res.statusCode >= 400) { // api request limit
                                } else { // append appdata to db
                                    var sql2 = "insert into app_info (app_name, category, package) values (?);";
                                    var data = [];

                                    var appJson = JSON.parse(res.body);

                                    console.log(appJson.title);

                                    data.push([appJson.title, Number(appJson.cat_int), appJson.package_name]);
                                    console.log(data);

                                    connection.query(sql2, data, function (err, result) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                }
                            }
                    });
                }
            });
        }
        connection.release();
    });

    res.writeHead(200, { 'content-Type': 'text/plain' });
    res.end("done");
}

exports.GetCategory = function(req, res) {
    console.log(req.body);

    var JsonData = req.body;

    var pool = mysql.createPool({
            host : "123.228.65.104",
            port : "4406",
            user : "clusters",
            password : "alfmvkr88",
            database : "sdb_data"
        });

    for(var i = 0; i < JsonData.data.length; i++) {
        //find appName in database
        JsonData.data[i].appName;
            //if there isn't
    
                //send package name to api server

                    //response success
                
                    //response fail
                        //use another api account

            //if there is
    }
}