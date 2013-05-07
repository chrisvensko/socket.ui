var path = require('path')
	express = require('express');

var init = function(app) {
	//app.use('/weblogger/bootstrap', express.static(path.resolve(__dirname, '/lib/bootstrap')));
	app.get('/weblogger/bootstrap/css/bootstrap.min.css', function(req, res) {
		res.sendfile(path.resolve(__dirname, 'lib/bootstrap/css/bootstrap.min.css'));
	});

	app.get('/weblogger/bootstrap/js/bootstrap.min.js', function(req, res) {
		res.sendfile(path.resolve(__dirname, 'lib/bootstrap/js/bootstrap.min.js'));
	});

	app.get('/weblogger', function (req, res) {
		res.sendfile(path.resolve(__dirname,'index.html'));
	});

	app.get('/weblogger/underscore.js', function(req, res) {
		res.sendfile(path.resolve(__dirname, 'lib/underscore.js'));
	});

	app.get('/weblogger/socket.ui.js', function(req, res) {
		res.sendfile(path.resolve(__dirname, 'lib/socket.ui.js'));
	});

	app.get('/weblogger/jquery.js', function(req, res) {
		res.sendfile(path.resolve(__dirname, 'lib/jquery.js'));
	});
};

module.exports = init;