var https = require('https');
var async = require('async');
const {
    URL
} = require('url');

var options = new URL('https://oembed.com/');

var oembedProviders = [
/*    {
        name:'',
        sitelink:'',
        domains: [''],
        schemas:[''],
        endpoint:'',
        health:false,
        https:false,
        type:'',//image, video, rich
        codetype:'', //<iframe/>, JSCode
        examples:[{
            stat:'',
            url: '',
            htmlcode:''
        }]
    }
*/
];

var providerArray = [];
var providerchecking = [];


async.series({
    //1st step is to download homepage from oembed.com and then parse the HTML page to identify the oembed providers into oembedProvidersp[]
    one: function (done) {
        getoEmbedProviders(done);
    },
    //2nd step is push all the oembed checking functions to array so that we can run it parallely in step 3
    two: function (done) {
        for (var item in oembedProviders) {
            var provider = oembedProviders[item];
            providerchecking.push(checkoEmbdProvider(provider));
        }
        done(null, null);
    },
    three: function (done) {
        var newAsync = require('async');
        newAsync.parallelLimit(providerchecking, 5, function (error, result) {
            done(null, result);
        });
    }
}, function (error, result) {
    console.log(error.message);
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
            var providerStrArray = findProviders(ProviderSection);
            for (var item in providerStrArray) {
                var provider = parseProvider(providerStrArray[item]);
                oembedProviders.push(provider);
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

//check if provider can work as wish
function checkProvider(provider, CheckProviderDone) {

    var checkexampleArray = [];
    var exampleArray = [];
    for (var item in provider.examples) {
        var example = {
            url: '',
            htmlcode: '',
            stat: 'needcheck'
        };
        example = provider.examples[item];
        exampleArray.push(example);
        checkexampleArray.push(getexample(example.url, example));
    }


    var newsync = require('async');
    newsync.series({
        //1st step is to get HTML code by request to each examples 
        one: function (done) {
            var checkasync = require('async');
            checkasync.parallelLimit(checkexampleArray, 5, function (error, result) {
                done(null, result);
            });
        },
        two: function (done) {
            var ret = {type:'', codetype:''};
            for (var i in provider.examples) {
                /*if(checkXML(provider.examples[i].htmlcode, ret)){
                    provider.examples[i].stat = 'XMLGood';
                    provider.type = ret.type;
                    provider.codetype = ret.codetype;
                }
                else if(checkJSON(provider.examples[i].htmlcode, ret)){
                    provider.examples[i].stat = 'JSONGood';
                    provider.type = ret.type;
                    provider.codetype = ret.codetype;
                }
                else
                    provider.examples[i].stat = 'NotWork';*/
            }
            done(null, null);
        }

    }, function (errer, result) {
        CheckProviderDone(null, null);
    });

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
    d.on('error', (er) => {
        console.error('Caught error!', er);
    });

    console.log('get example from:' + option);

    d.enter();

    if (option.match('^https://') != null)
        d.run( ()=> {httpsClientRequester.get(option, function (res) {
            res.on('data', function (data) {
                htmlcode = htmlcode + data;
            }).on('end', function () {
                ret.htmlcode = htmlcode;
                ret.stat = true;
                getHttpDone(null, null);
            }).on('error', function (data) {
                ret.htmlcode = htmlcode;
                ret.stat = false;
                getHttpDone(null, null);
            });
        });});
    else if (option.match('^http://') == null) {
        option = 'https://' + option;
        d.run( () => {httpsClientRequester.get(option, function (res) {
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
        });});
    } else
        d.run( ()=> {httpClientRequester.get(option, function (res) {
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
        });});

    //d.exit();
}

function parseProvider(providerstr) {
    var provider = {
        name: '',
        sitelink: '',
        domains: [''],
        schemas: '',
        endpoint: '',
        examples: [
        /*    {
            work:false,
            url: ''
        }*/
        ],
        https: false,
        health: false,
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
        result = loopstr.match(schemaregxx);
        if (result == null)
            break;
        provider.schemas += result[1].trim() + ';';
        var temp = provider.schemas.split('/');
        provider.domains.push(temp[2].trim());
        loopstr = loopstr.substr(result.index + result[0].length, loopstr.length - result[0].length);
    }

    //find endpoint
    var endpointreg = 'API endpoint: <code>([\\S]+)</code>';
    var endpointregxx = new RegExp(endpointreg);
    result = providerstr.match(endpointregxx);
    provider.endpoint = result[1].trim();

    //find examples
    var examplereg = 'Example: <a href="[\\S]+">([\\S]+)</a>';
    var exampleregxx = new RegExp(examplereg);
    loopstr = providerstr;

    while (true) {
        result = loopstr.match(exampleregxx);
        if (result == null)
            break;
        var example = {stat:'', url:'', htmlcode:''};
        example.url = result[1].trim();
        provider.examples.push(example);
        loopstr = loopstr.substr(result.index + result[0].length, loopstr.length - result[0].length);
    }

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
    }

    return providers;
}