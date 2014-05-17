var mysql = require('mysql');

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
                            connection.release();

                            res.writeHead(200, {'content-Type' : 'text/plain'});
	                        res.end('res');
                        }
                    });
                }
            }

        });
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