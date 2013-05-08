var globalSockets = {};
var logEl = $('#socketUiOutput');
var onBottom = true;
var connected = true;

var socketToggleBtn = $('#toggleSocketConnection');
var logEl = $('#socketUiOutput');
var uriEl = $('#hookSocketUri');

logEl.append('Source:msg\n=======\n');

var subscribe = function(uri) {
	if(_.isEmpty(uri)) {
		uri = uriEl.val();
		uriEl.val('');
	}

	if(uri.substr(0,4) !== 'http') {
		uri = 'http://' + uri;
	}

	globalSockets[uri] = newSocket(uri);
	if(!connected) {
		setTimeout(function() {
			globalSockets[uri].disconnect();
		}, 250);
	}
	return globalSockets[uri];
};

var setConnectedStatus = function() {
	var html = !connected ? 'Connect' : 'Disconnect';
	socketToggleBtn.html(html);
};

var connect = function() {
	connected = true;
	_.each(globalSockets, function(socket) {
		socket.connect();
	});
};

var disconnect = function() {
	console.log('Disconnecting');
	connected = false;
	_.each(globalSockets, function(socket) {
		socket.disconnect();
	});
};

var scrollToBottom = function() {
	$('html, body').scrollTop($(document).height());
};

var toggleConnection = function() {
	if(!connected) {
		connect();
	} else {
		disconnect();
	}
	setConnectedStatus();
};

var getDocHeight = function() {
	var body = document.body;
	var doc = document.documentElement;
	return Math.max(
		Math.max(body.scrollHeight, doc.scrollHeight),
		Math.max(body.offsetHeight, doc.offsetHeight),
		Math.max(body.clientHeight, doc.clientHeight)
	);
};

var onBottom = function() {
	return $(window).scrollTop() + $(window).height() >= $(document).height() - 20;
};

var addMessage = function(uri, msg) {
	if(msg.substr(-1) !== '\n') {
		msg+='\n';
	}

	var uriText = '<span class="muted">' + uri + '</span> ';

	logEl.append(uriText + msg);

	if(onBottom()) {
		scrollToBottom();
	}
};

var addWarning = function(uri, warning) {
	addMessage(uri, '<span class="text-warning">' + warning + '</span>');
};

var addError = function(uri, err) {
	addMessage(uri, '<span class="text-error">' + err + '</span>');
};

var renderEvent = function(uri, ch, data) {
	var error = false;
	var renderer = renderers[ch] ? renderers[ch] : renderers.msg;
	var msg = renderer(uri, data);
	if(!msg) {
		return;
	}

	if(msg.msg) {
		msg = msg.msg;
		error = true;
	}
	if(error || msg.match(/error/i)) {
		addError(ch + ' - ' + uri, msg);
	} else {
		addMessage(ch + ' - ' + uri, msg);
	}
};

var renderers = {
	error: function(uri, msg) {
		return {
			msg: msg
		};
	},
	msg: function(uri, msg) {
		return msg;
	},
	data: function(uri, obj) {
		if(!obj.data) {
			console.log('Missing data', obj);
			return this.msg(obj);
		}
		return obj.source + ':' + obj.data;
	},
	request: function(uri, req) {
		if(!req.statusCode) {
			return this.data(req);
		}
		var labelCls = '';
		if(req.statusCode >= 500) {
			labelCls = 'label-important';
		} else if(req.statusCode >= 400) {
			labelCls = 'label-warning';
		}
		var msg = '<span class="label ' + labelCls + '">' + req.statusCode + '</span> [' + req.method + ']';
		if(req.method === 'GET' && req.url) {
			msg += ' <a href="' + uri + req.url + '">' + req.url + '</a>';
		} else {
			msg += ' ' + req.url;
		}

		if(req.statusCode >= 500) {
			return this.error(msg);
		}

		return msg;
	},
	job: function(uri, job) {
		if(Array.isArray(job)) {
			job = job[0];
		}
		if(_.isEmpty(job) || _.isEmpty(job.status)) {
			return false;
		}
		var percentComplete = '0';
		if(job.status.progress) {
			percentComplete = Math.round(job.status.progress.completed / job.status.progress.total * 100);
		}
		return '(' + job.id + ') ' + job.status.state.is + ' - ' + job.status.state.message +
			'<div class="progress" style="height: 10px;"><div class="bar bar-success" style="width:' +
			percentComplete + '%;"></div></div>';
	}
};

var newSocket = function(uri) {
	var socket = io.connect(uri);

	var addChannelListener = function(ch) {
		socket.on(ch, _.bind(renderEvent, this, uri, ch));
	};
	// Hook into events
	addChannelListener('data');
	addChannelListener('error');
	addChannelListener('request');
	addChannelListener('message');
	addChannelListener('notification');
	addChannelListener('job');

	if(socket.on) {
		addMessage('CONNECTED TO SOCKET :' + uri);
	}

	return {
		socket: socket,
		connect: function() {
			socket.socket.connect();
		},
		disconnect: function() {
			console.log('Disconnecting from socket');
			socket.disconnect();
		}
	};
};

setConnectedStatus();

var localhost = subscribe('http://localhost:3000');
connect();