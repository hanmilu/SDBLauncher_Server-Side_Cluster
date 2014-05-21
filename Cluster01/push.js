var mysql = require('mysql');
var gcm = require('node-gcm');

exports.regist = function (req, res) {
    var pool = mysql.createPool({
            host : "123.228.65.104",
            port : "4406",
            user : "clusters",
            password : "alfmvkr88",
            database : "sdb_data"
        });

    console.log (req.param('regId'));
    console.log (req.params);

    pool.getConnection(function(err, connection){
        //var post = {device_num:"111", reg_id : connection.escape(req.param('regId')), google_id : "aaa@aaa.com"};
        var post2 = ['11123142342',(req.param('regId')),'aaa@aaa.com'];
        connection.query("insert into user_info (device_num, reg_id, google_id) values (?);", [post2], function(err, result){
            if (err) {
                console.log(err);
            }

            console.log(result);
        });

        connection.release();
    });

    console.log(req.param('regId'));
	res.end();
} 


exports.send_push = function(req, res) {

	var message = new gcm.Message();
	var sender = new gcm.Sender('AIzaSyAcagZo44cCppJyvl_ZYVSwI7hlpTCOXD8');
    var registrationIds = [];

    // Optional
	message.addData('key1','message1');
	message.addData('key2','message2');
	message.collapseKey = 'demo';
	message.delayWhileIdle = true;
	message.timeToLive = 3;

	console.log(req.body.id);

    var connection = mysql.createConnection({
            host : "123.228.65.104",
            port : "4406",
            user : "clusters",
            password : "alfmvkr88",
            database : "sdb_data"
        });

    connection.connect(function(err){
        if(err){
        }else{
            connection.query("select reg_id from user_info where google_id = ?", req.body.id, function(err, result){
                console.log(result[0]['reg_id']);
                //registrationIds = result;
                for(var i = 0; i < result.length; i++){
                    var temp = result[i]['reg_id'].replace("\'","");
                    temp = temp.replace("\'","");
                    registrationIds.push(temp);
                }
                console.log("reg : ");
                console.log(registrationIds);
                console.log("res : ");
                sender.send(message, registrationIds, 4, function (err, result) {
                    console.log(result);
                });
            });
        }
    });

    // At least one required
        //for(var regid in registrationIds)
        //{
        //    registrationIds.push(regid);
        //}
    /**
     * Parameters: message-literal, registrationIds-array, No. of retries, callback-function
     */

    

// 	sender.sendNoRetry(message, registrationIds-array, function (err, result) {
//     console.log(result);
// }); // without retry

}