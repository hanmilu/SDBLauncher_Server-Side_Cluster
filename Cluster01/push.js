var mysql = require('mysql');
var gcm = require('node-gcm');

exports.regist = function (req, res) {
    var pool = mysql.createPool({
            user : "root",
            password : "alfmvkr88*",
            database : "test"
        });

    console.log (req.param('regId'));
    console.log (req.params);

    pool.getConnection(function(err, connection){
        var post = {UserID : 'a', GCMRegID : connection.escape(req.param('regId'))};
        connection.query("insert into user set ?", post, function(err, result){
            if (err) {
                console.log(err);
                throw err;
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

    var connection = mysql.createConnection({
            user : "root",
            password : "alfmvkr88*",
            database : "test"
        });

    connection.connect(function(err){
        if(err){
        }else{
            connection.query("select GCMRegID from user", function(err, result){
                console.log(result[0]['GCMRegID']);
                //registrationIds = result;
                for(var i = 0; i < result.length; i++){
                    var temp = result[i]['GCMRegID'].replace("\'","");
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