var https = require('https');
var async = require('async');
const {
    URL
} = require('url');

var options = new URL('https://oembed.com/');

var providerStrArray = [];
var providerArray = [];
var providerchecking = [];


async.series({
    one: function (done) {
        getoEmbedProviders(done);
    },
    two: function (done) {
        for (var item in providerArray) {
            var provider = providerArray[item];
            providerchecking.push(checkoEmbdProvider(provider));
        }
        done(null, null);
    },
    three: function (done) {
        var newAsync = require('async');
        newAsync.parallelLimit(providerchecking, 100, function (error, result) {
            done(null, null);
        });
    }
}, function (error, result) {
    console.log('end');
});




function getoEmbedProviders(done) {

    https.get(options, function (res) {

        //var contentType = res.headers['content-type'];

        let error;

        if (res.statusCode != 200) {
            error = new Error('Request to get oEmbed.com Homepage failed\n' + `Status Code: ${res.statusCode}`);
        }

        if (error) {
            console.error(error.message);
            res.resume();
            return;
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

var checkoEmbdProvider = function (provider) {
    return function (done) {
        return checkProvider(provider, done);
    };
};

function checkProvider(provider, CheckProviderDone) {

    var checkexampleArray = [];
    var exampleArray = [];
    for (var item in provider.examples) {
        var example = {
            url: '',
            htmlcode: '',
            stat: 'needcheck'
        };
        example.url = provider.examples[item];
        exampleArray.push(example);
        checkexampleArray.push(getexample(example.url, example));
    }


    var newsync = require('async');
    newsync.series({
            one: function (done) {
                var checkasync = require('async');
                checkasync.parallelLimit(checkexampleArray, 5, function (error, result) {
                    done(null, null);
                });
            },
            two: function (done) {
                for (var i in provider.examples) {
                    console.log('#' + i + ' ' + exampleArray[i].url + '\n');
                    console.log(exampleArray[i].stat + '\n');

                }
                done(null, null);
            }

        }, function (errer, result) {
            CheckProviderDone(null, null);
        }

    );

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

function getexample(option, ret) {
    return function (syncdone) {
        return getHttp(option, ret, syncdone);
    };
}

function getHttp(option, ret, getHttpDone) {
    var httpsClientRequester = require('https');
    var httpClientRequester = require('http');
    var htmlcode = '';

    const d = require('domain').create();
    d.on('error', function (err) {
        console.log(err.message);
        getHttpDone(null, null);
    });
    console.log('get example from:' + option);

    if (option.match('^https://') != null)
        d.add(httpsClientRequester.get(option, function (res) {
            res.on('data', function (data) {
                htmlcode = htmlcode + data;
            }).on('end', function () {
                ret.htmlcode = htmlcode;
                ret.stat = 'success';
                getHttpDone(null, null);
            }).on('error', function (data) {
                ret.htmlcode = htmlcode;
                ret.stat = 'fail';
                getHttpDone(null, null);
            });
        }));
    else if (option.match('^http://') == null) {
        option = 'https://' + option;
        d.add(httpsClientRequester.get(option, function (res) {
            res.on('data', function (data) {
                htmlcode = htmlcode + data;
            }).on('end', function () {
                ret.htmlcode = htmlcode;
                ret.stat = 'success';
                getHttpDone(null, null);
            }).on('error', function (data) {
                ret.htmlcode = htmlcode;
                ret.stat = 'fail';
                getHttpDone(null, null);
            });
        }));
    } else
        d.add(httpClientRequester.get(option, function (res) {
            res.on('data', function (data) {
                htmlcode = htmlcode + data;
            }).on('end', function () {
                ret.htmlcode = htmlcode;
                ret.stat = 'success';
                getHttpDone(null, null);
            }).on('error', function (data) {
                ret.htmlcode = htmlcode;
                ret.stat = 'fail';
                getHttpDone(null, null);
            });
        }));
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