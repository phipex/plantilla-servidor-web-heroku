let static = require('node-static');
let http = require('http');
let httpProxy = require('http-proxy');

// Listen on a specific host via the HOST environment variable
let host = process.env.HOST || '0.0.0.0';
// Listen on a specific port via the PORT environment variable
let port = process.env.PORT || 8080;
//
// Create a node-static server instance to serve the './public' folder
//
let file = new static.Server('./static');

//
// Create your proxy server and set the target in the options.
//
var proxy = httpProxy.createProxyServer({});

http.createServer(function (request, response) {

    let isRestRequest = request.method === 'POST';

    if (isRestRequest) {
        
        const { method, url } = request;
        const host = request.headers.host 
        proxy.web(request, response, {
            target: host + url,
            secure: true,
            changeOrigin: true
        });
    } else {
        request.addListener('end', function () {
            // Serve files!
            //
            file.serve(request, response);
        }).resume();        
    }
    
// set header for CORS
proxy.on("proxyRes", function(proxyRes, req, res) {
	enableCors(req, res);
});

    
    var enableCors = function(req, res) {
        if (req.headers['access-control-request-method']) {
            res.setHeader('access-control-allow-methods', req.headers['access-control-request-method']);
        }
    
        if (req.headers['access-control-request-headers']) {
            res.setHeader('access-control-allow-headers', req.headers['access-control-request-headers']);
        }
    
        if (req.headers.origin) {
            res.setHeader('access-control-allow-origin', req.headers.origin);
            res.setHeader('access-control-allow-credentials', 'true');
        }
    };

}).listen(port);