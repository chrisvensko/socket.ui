		var connected = false;
		var logEl = $('#socketUiOutput');
		var onBottom = true;

		function getDocHeight() {
			var D = document;
			return Math.max(
				Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
				Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
				Math.max(D.body.clientHeight, D.documentElement.clientHeight)
			);
		}
		toggleConnection = function() {
			if(connected) {
				window.disconnect();
			} else {
				window.connect();
			}
			setConnected();
		};
		var setConnected = function() {
			var html = connected ? 'Disconnect' : 'Connect';
			$('#toggleSocketConnection').html(html);
		};

		var scrollToBottom = function() {
			$('html, body').scrollTop($(document).height());
		};

		var addMessage = function(msg) {
			onBottom = $(window).scrollTop() + $(window).height() >= $(document).height() - 20;
			if(msg.substr(-1) !== '\n') {
				msg+='\n';
			}

			logEl.append(msg);

			if(onBottom) {
				scrollToBottom();
			}
		};

		var addWarning = function(warning) {
			addMessage('<span class="text-warning">' + warning + '</span>');
		};

		var addError = function(err) {
			addMessage('<span class="text-error">' + err + '</span>');
		};

		var onData = function(obj) {
			if(!obj.data) {
				console.log('Missing data', obj);
			}
			var msg = obj.source + ':' + obj.data;
			if(msg.match(/error/i)) {
				addError(msg)
			} else {
				addMessage(msg);
			}
		};

		var logRequest = function(req) {
			if(!req.statusCode) {
				return onData(req);
			}
			if(req.statusCode >= 500) {
				addError('<span class="label label-important">' + req.statusCode + '</span>' + req.data);
			} else if(req.statusCode >= 400) {
				addWarning(req.data);
			} else {
				addMessage(req.data);
			}
		};

		onMessage = function(data) {
			console.log('data', data);
		};

		window.connect = function() {
			connected = true;
			var socket = io.connect('http://localhost');

			socket.on('data', onData);
			socket.on('error', addError);
			socket.on('request', logRequest);
			socket.on('message', onMessage);
			socket.on('*', onMessage);

			window.connect = function() {
				connected = true;
				socket.socket.connect();
			};
			window.disconnect = function() {
				connected = false;
				socket.disconnect();
			};
		};
		logEl.append('Source:msg\n=======\n');
		toggleConnection();