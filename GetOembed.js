
var http = require('http');

var options = {
    host: 'oembed.com',
    port: 80,
    path: '/'
};

var html = '';

var providerStrArray = [];


http.get(options, function (res) {
    res.on('data', function (data) {
        html = html + data;
    }).on('end', function () {
        //html = html.replace(/[\r\n]/g, '');
        var start = html.match('<p>To add new providers');
        var end = html.match('<a name=\"section7.2');
        var ProviderSection = html.substr(start.index, end.index - start.index);
        ProviderSection = ProviderSection.replace(/[\t\v\r\n]/g, '')
        providerStrArray=findProviders(ProviderSection);
        console.log(providerStrArray);
    })
})

function parseProvider(providerstr){
    var provider = {name, sitelink, domains, schemas, endpoint, sample, working:false, supporting:false };

}
function findProviders(data) {
    var regstr = '<p>[\\w. 0-9]*\\(<a href=\\"http';
    var startregx = new RegExp(regstr);
    var scanstr = data;
    var first = true;
    var prev = 0;
    var providers = [];
   
    do {
        var nextstop = scanstr.match(startregx);
        if(nextstop==null){
            scanstr.match()
            providers.push(prestr);
            break;
        }
        if (first == true) {
            first = false;
            prestr = scanstr.substr(nextstop.index, scanstr.length);
            scanstr = scanstr.substr(nextstop.index + regstr.length-3, scanstr.length);
        } else {
            providers.push(prestr.substr(0, nextstop.index+regstr.length-3));
            prestr = scanstr.substr(nextstop.index, scanstr.length);
            scanstr = scanstr.substr(nextstop.index + regstr.length-3, scanstr.length);
        }
    } while (true);

    return providers;
}
