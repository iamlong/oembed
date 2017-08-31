
var $ = require ('fs');
var oembedJSON = JSON.parse(fs.readFileSync('./providers.txt'));

var count =0;
for(var provideritem in oembedJSON){
    var provider = eval(oembedJSON[provideritem]);
    console.log(provider.provider_name);
    for(var endPointitem in provider.endpoints)
        console.log(endPointitem[0]);
    count ++;
}

console.log('total provider count ='+count );