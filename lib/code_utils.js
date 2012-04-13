byte_array_to_string = function(array) {
  var ret_val = [];
  for(var j=0;j<array.length;j++) 
    ret_val.push(array[j].toString(16));
  return ret_val;
}      

if(typeof(exports) != 'undefined') {
  exports.byte_array_to_string = byte_array_to_string;
} 
      