var http = require('http');
var async = require('async');

var options = {
    host: 'oembed.com',
    port: 80,
    path: '/'
};

var providerStrArray = [];
var providerArray = [];
var providerchecking = [];

var check = function (provider) {
    return function (done) {
        checkProvider(provider, done);
    };
};

async.series({
    one: function (done) {
        getoEmbedProviders(done);
    },
    two: function (done) {
        for (var item in providerArray) {
            var provider = providerArray[item];
            providerchecking.push(check(provider));
        }
        done(null, null);
    },
    three: function (done) {
        var newAsync = require('async');
        newAsync.parallelLimit(providerchecking
            , 2, function (error, result) {
                done(null, null);
            });
    }
}, function (error, result) {
    console.log('end');
});




function getoEmbedProviders(done) {

    http.get(options, function (res) {

        //var contentType = res.headers['content-type'];

        let error;

        if (res.statusCode != 200) {
            error = new Error('Request to get oEmbed.com Homepage failed\n' + `Status Code: ${statuscode}`);
        }

        if (error) {
            console.error(error.message);
            res.resume();
        }

        var rawdata = '';

        res.on('data', (chunk) => {
            rawdata = rawdata + chunk;
        });

        res.on('end', () => {

            var start = rawdata.match('<p>To add new providers');
            var end = rawdata.match('<a name=\"section7.2');
            if (end == null)
                end.index = rawdata.length;
            var ProviderSection = rawdata.substr(start.index, end.index - start.index);
            ProviderSection = ProviderSection.replace(/[\t\v\r\n]/g, '');
            providerStrArray = findProviders(ProviderSection);
            for (var item in providerStrArray) {
                var provider = parseProvider(providerStrArray[item]);
                providerArray.push(provider);
            }
            done(null, null);
        });

    });
}

function checkProvider(provider, done) {

    var httplocal = require('http');
    var embedcode = '';
    for (var item in provider.examples) {
        var url = provider.examples[item];
        //var option = getOption(url);
        console.log(url + '\n');
        /*
        httplocal.get(option, function (res) {
            res.on('data', function (data) {
                embedcode = embedcode + data;
            }).on('end', function () {
                var response = "";
                embedcode = embedcode.trim();
                var starsig = '^{';
                var startregxx = new RegExp('^{');
                var ifxml = embedcode.match('<?xml') == null ? false : true;
                var ifjson = embedcode.match(startregxx) == null ? false : true;
                if (!ifxml || !ifjson) {
                    provider.working = false;
                } else {

                    var json = embedcode;
                    if (ifxml) {
                        var parsestring = require('xml2js').parseString;
                        parserstring(embedcode, function (err, result) {
                            json = result;
                        });
                    }
                }
            }).on('error', function(data){
                console.log('error in', provider.name);
            });
        });*/

    }

    done(null, null);

    return provider;

}

/* function getOption(url) {

    if (url.match('http') == null)
        url = 'http://' + url;

    var optionreg = 'https*://([\\w\\d.-]+):*(\\d*)/([\\S ]+)';
    var optionregxx = new RegExp(optionreg);
    var result = url.match(optionregxx);


    var option = {
        host: '',
        port: '',
        path: ''
    };
    option.host = result[1];
    if (result[2] == '')
        option.port = '80';
    else
        option.port = result[2];
    option.path = result[3];
    if (option.host == '169.53.132.52')
        return;
    return option;
}
 */
function parseProvider(providerstr) {
    var provider = {
        name: '',
        sitelink: '',
        domains: '',
        schemas: '',
        endpoint: '',
        examples: [],
        https: false,
        working: false,
        supporting: false
    };

    //find name, sitelink
    var namereg = '<p>([\\S ]+)\\(<a href="[\\S]+">([\\S]+)</a>\\)</p>';
    var nameregxx = new RegExp(namereg);
    var result = providerstr.match(nameregxx);
    provider.name = result[1].trim();
    provider.sitelink = result[2].trim();

    //find domains and schemas
    var schemareg = 'URL scheme: <code>([\\S]+)</code>';
    var schemaregxx = new RegExp(schemareg);
    var loopstr = providerstr;

    while (true) {
        var result = loopstr.match(schemaregxx);
        if (result == null)
            break;
        provider.schemas += result[1].trim() + ';';
        var temp = provider.schemas.split('/');
        provider.domains += temp[2].trim() + ';';
        loopstr = loopstr.substr(result.index + result[0].length, loopstr.length - result[0].length);
    };

    //find endpoint
    var endpointreg = 'API endpoint: <code>([\\S]+)</code>';
    var endpointregxx = new RegExp(endpointreg);
    var result = providerstr.match(endpointregxx);
    provider.endpoint = result[1].trim();

    //find examples
    var examplereg = 'Example: <a href="[\\S]+">([\\S]+)</a>';
    var exampleregxx = new RegExp(examplereg);
    var loopstr = providerstr;

    while (true) {
        var result = loopstr.match(exampleregxx);
        if (result == null)
            break;
        provider.examples.push(result[1].trim());
        loopstr = loopstr.substr(result.index + result[0].length, loopstr.length - result[0].length);
    };

    return provider;
}

function findProviders(data) {

    var regstr = '><p>[\\S ]+\\(<a href=\\"http';
    var startregx = new RegExp(regstr);
    var scanstr = data;
    var first = true;
    var providers = [];
    var prestr = '';

    while (true) {
        var nextstop = scanstr.match(startregx);
        if (nextstop == null && prestr != '') {
            scanstr.match();
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
    };

    return providers;
}