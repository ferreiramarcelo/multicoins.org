'use strict';

var utils = require("./utils");
const url = require('url');
const g_constants = require('./constants');

exports.handle = function(app)
{
    app.get('/', function (req, res) {res.render('index.html');});
   
    app.get('*.blockr.io/api/v1/address/*', httpProxy);
    app.post('*.blockr.io/api/v1/tx/push', httpProxy);
    
    app.post('/api/v1/tx/push/ppc', function (req, res) {
        var strJSON = '{"jsonrpc": "1.0", "id":"curltest", "method": "sendrawtransaction", "params": ["'+req.body.hex+'"] }';
        utils.postString(g_constants.my_domain, 9902, "/", {'Content-Type': 'text/plain', 'Authorization': 'Basic a3p2OnEyMjEw'}, strJSON, function(result) {
            if (result.data)
            {
                try {
                    if (result.success)
                        result.data = JSON.parse(result.data);
                    if (result.data.error && result.data.error.message)
                        result.message = result.data.error.message+"<br>";
                    
                    if (result.data.result)
                        result.data = result.data.result
                    else
                        result.success = false; 
                }
                catch(e) {}
            }
            else
            {
                result.success = false;
            }

            const ret = result.success ? 
                        {status: result.success, message: result.message || "", data: result.data || ""} :
                        {status: result.success, message: 0, data: result.message || ""};
            res.end(JSON.stringify(ret));
        });
    });
};

function httpProxy(req, res)
{
    var ph = url.parse(req.url);
    const host = ph.path.substr(1, ph.path.indexOf('/', 1)-1);
    const path = ph.path.substr(ph.path.indexOf('/', 1));
    
    if (req.method == 'POST')
    {
        const str = '{"hex" : "'+req.body.hex+'"}';
        utils.postJSON(host, path, str, function(err){
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(err.data);
        })
        return;
    }

    var options = {
        port: 80,
        hostname: host,
        method: req.method,
        path: path,
        headers: req.headers
    };
    options.headers.host = host;
    
    var proxyRequest = require("http").request(options);
    
    proxyRequest.on('response', function(proxyResponse) {
        
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
		
		proxyResponse.on('data', function(chunk) {
			res.write(chunk, 'binary');
        });
        proxyResponse.on('end', function() { 
			res.end();
		});
    });
    
    req.on('data', function(chunk) {
        proxyRequest.write(chunk, 'binary');
    });
    
    req.on('end', function() { 
        proxyRequest.end() 
    });
    
	proxyRequest.on('error', function(e) {
		console.log('proxyRequest error' + JSON.stringify(e));
		res.end(JSON.stringify(e));
	});   
	
	/*if (req.body && req.body.hex)
	    proxyRequest.end('{"hex" : "'+req.body.hex+'"}');*/
}

