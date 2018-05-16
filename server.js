// 用 NodeJs 做的简易服务器
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

var PORT = 3000; //端口
var dist = "./"; //根目录
var mine = {
    ".css": "text/css",
    ".gif": "image/gif",
    ".html": "text/html",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "text/javascript",
    ".json": "application/json",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".swf": "application/x-shockwave-flash",
    ".tiff": "image/tiff",
    ".txt": "text/plain",
    ".wav": "audio/x-wav",
    ".wma": "audio/x-ms-wma",
    ".wmv": "video/x-ms-wmv",
    ".xml": "text/xml",
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".exe": "application/octet-stream",
    ".md": "text/x-markdown"
};
var default_visit_list = ["index.html", "index.htm", "default.html", "default.htm"];

var default_visit = function(request, response, default_visit_file_list, i) {
    fs.exists(path.join(__dirname, dist, url.parse(request.url).pathname, default_visit_file_list[i]), function(exists) {
        if (exists) { // 若 index.html 存在
            fs.readFile(path.join(__dirname, dist, url.parse(request.url).pathname, default_visit_file_list[i]), "binary", function(err, file) {
                response.writeHead(200, {
                    'Content-Type': mine[".html"] || "text/plain"
                });
                response.write(file, "binary");
                response.end();
            });
        } else { // 若 index.html 不存在            
            if (default_visit_file_list.length - 1 == i) {
                console.log("\x1B[31mERROR\x1B[39m: " + default_visit_file_list[0] + " is not exists.");
                file_not_found
                    (response, request);
            } else {
                default_visit(request, response, default_visit_list, i + 1);
            }
        }
    });
}

var file_not_found = function(response, request) {
    response.writeHead(404, {
        'Content-Type': 'text/plain'
    });
    response.write("This request URL " + url.parse(request.url).pathname + " was not found on this server.");
    response.end();
}

var server = http.createServer(function(request, response) {
    var realPath = path.join(__dirname, dist, url.parse(request.url).pathname);
    if (url.parse(request.url).pathname == "/" || url.parse(request.url).pathname.split("/")[url.parse(request.url).pathname.split("/").length - 1].indexOf(".") == -1) { //访问目录为 "/"
        default_visit(request, response, default_visit_list, 0);
    } else { //指定路径
        var ext = path.extname(realPath);
        fs.exists(realPath, function(exists) {
            if (!exists) { //指定路径的文件不存在
                console.log("\x1B[31mERROR\x1B[39m: " + realPath + " is not exists.");
                file_not_found(response, request);
            } else { //指定路径的文件存在
                fs.readFile(realPath, "binary", function(err, file) {
                    response.writeHead(200, {
                        'Content-Type': mine[ext] || "text/plain"
                    });
                    response.write(file, "binary");
                    response.end();
                });
            }
        });
    }
});

server.listen(PORT);

server.on('listening', function() {
    console.log("Server runing at http://127.0.0.1:" + server.address().port + ".");
});

server.on('error', function() {
    console.log("Server Listen on " + PORT + " error.");
});