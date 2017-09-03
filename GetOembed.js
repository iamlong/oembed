
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
        providerStrArray = findProviders(ProviderSection);
        for (var item in providerStrArray) {
            var provider = parseProvider(providerStrArray[item]);
            console.log(item+':'+provider.name+'\t'+provider.endpoint +'\n');
    }
    })
})

function parseProvider(providerstr) {
    var provider = { name: '', sitelink: '', domains: '', schemas: '', endpoint: '', examples: [], https: false, working: false, supporting: false };

    //find name, sitelink
    //var namereg = '<p>([\\w .]+)\\(<a href="[\\w.:/>\\-]+">([\\w.:/>\\-]+)</a>\\)</p>';
    var namereg = '<p>([\\w\\d .]+)\\(<a href="[\\S]+">([\\S]+)</a>\\)</p>';
    var nameregxx = new RegExp(namereg);
    var result = providerstr.match(nameregxx);
    provider.name = result[1].trim();
    provider.sitelink = result[2].trim();

    //find domains and schemas

    //var schemareg = 'URL scheme: <code>([\\w\\d:/.*\\-?=]+)</code>';
    var schemareg = 'URL scheme: <code>([\\S]+)</code>';
    var schemaregxx = new RegExp(schemareg);
    var loopstr = providerstr;

    do {
        var result = loopstr.match(schemaregxx);
        if (result == null)
            break;
        provider.schemas += result[1].trim() + ';';
        var temp = provider.schemas.split('/');
        provider.domains += temp[2].trim() + ';';
        loopstr = loopstr.substr(result.index + result[0].length, loopstr.length - result[0].length);
    } while (true);

    //find endpoint
    //var endpointreg = 'API endpoint: <code>([\\w\\d:/.*>\\-\\{\\}?=]+)';
    var endpointreg = 'API endpoint: <code>([\\S]+)</code>';
    var endpointregxx = new RegExp(endpointreg);
    var result = providerstr.match(endpointregxx);
    provider.endpoint = result[1].trim();

    //find examples
    //var examplereg = 'Example: <a href="[\\w\\d/:\\.?=%\\-]+">([\\w\\d/:\\.?=%\\-]+)</a>';
    var examplereg = 'Example: <a href="[\\S]+">([\\S]+)</a>';
    var exampleregxx = new RegExp(examplereg);
    var loopstr = providerstr;

    do {
        var result = loopstr.match(exampleregxx);
        if (result == null)
            break;
        provider.examples.push(result[1].trim());
        loopstr = loopstr.substr(result.index + result[0].length, loopstr.length - result[0].length);
    } while (true);

    return provider;
}

function findProviders(data) {
    var regstr = '<p>[\\S ]*\\(<a href=\\"http';
    var startregx = new RegExp(regstr);
    var scanstr = data;
    var first = true;
    var prev = 0;
    var providers = [];

    do {
        var nextstop = scanstr.match(startregx);
        if (nextstop == null) {
            scanstr.match()
            providers.push(prestr);
            break;
        }
        if (first == true) {
            first = false;
            prestr = scanstr.substr(nextstop.index, scanstr.length);
            scanstr = scanstr.substr(nextstop.index + regstr.length - 3, scanstr.length);
        } else {
            providers.push(prestr.substr(0, nextstop.index + regstr.length - 3));
            prestr = scanstr.substr(nextstop.index, scanstr.length);
            scanstr = scanstr.substr(nextstop.index + regstr.length - 3, scanstr.length);
        }
    } while (true);

    return providers;
}
