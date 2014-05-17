var mysql = require('mysql');
/*
 * GET home page.
 */

exports.index = function(req, res){

  res.render('index', { title: 'ExpressA' });
};