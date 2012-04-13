var codestore = {};

codestore.loadInt = function(table,key,default_value) {
  return parseInt(codestore.load(table,key,default_value));
}

codestore.load = function(table,key,default_value) {
  key = table+'_'+key;
  if(typeof(localStorage[key]) == 'undefined') {
     localStorage[key] = default_value;     
  }
  return localStorage[key];
}
codestore.save = function(table,key,value) {
  key = table+'_'+key;
  localStorage[key] = value;
}
codestore.findKeys = function(table) {
  var ret_val = [];
  var k = Object.keys(localStorage);
  
  for(var i=0;i<k.length;i++) {
    if(k[i].indexOf(table+'_')==0) {
      var key = k[i];
      var name = k[i].replace(table+'_','');
      ret_val.push({key:key,name:name});
    }
  }
   
  return ret_val;
}

