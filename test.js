var isType = function(type){
  return function(obj){
      return toString.call(obj) == '[object '+type+']';
    }
  };
  var isArray = isType('Array');
  if(isArray(11)){
      console.log('this is array');
  }else
    console.log('this is not array');