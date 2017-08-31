
var http = require('http');

var options = {
    host: 'oembed.com',
    port:80,
    path:'/'
};

var html = '';

http.get(options, function(res){
    res.on('data', function(date){
        html = html + data;
    }).on('end', function(){
        console.log(html);
    })
})