var http = require('http'),
	express = require('express'),
	app = express(),
	port = 8081;

app.use('/', express.static(__dirname + '/www'));

/*创建服务端*/
http.createServer(app).listen(port, function(){
	console.log('启动服务器：http://127.0.0.1:', port);

});
