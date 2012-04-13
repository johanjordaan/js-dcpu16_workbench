var codestore = {};

codestore.loadInt = function(table,key,default_value) {
  return parseInt(codestore.load(table,key,default_value));
}

codestore.splitKey = function(key) {
  var parts = key.split('_');
  return { table:parts[0],key:parts[1] };
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

codestore.delete = function(key) {
  localStorage.removeItem(key);
}
