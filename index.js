var path = require('path');

var init = function(app) {
	app.get('/', function (req, res) {
		res.sendfile(path.resolve(__dirname,'index.html'));
	});
	app.get('/jquery.js', function(req, res) {
		res.sendfile(path.resolve(__dirname, 'lib/jquery.js'));
	});
};

module.exports = init;