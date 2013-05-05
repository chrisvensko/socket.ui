var path = require('path');

var init = function(app) {
	app.get('/', function (req, res) {
		res.sendfile(path.resolve(__dirname,'index.html'));
	});
};

exports.module = init;