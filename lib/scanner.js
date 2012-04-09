Scanner = function(rules,error_handler) {
  this.rules = rules;
  this.error_handler = error_handler;
}

Scanner.prototype.process = function(input) {
  for(var i =0;i<input.length;i++) {
    var found_match = false;
    for(var ri=0;ri<this.rules.length;ri++) {
      var rule_pattern = this.rules[ri][0];
      var rule_f = this.rules[ri][1];
      var match = rule_pattern.exec(input.substr(i));    
      if(match!=null) {
        if(match['index']==0) {       // Fix this matching. This is inefficient.
          rule_f(match[0]);
          i+= match[0].length-1;
          found_match = true;
          break;
        }
      }
    }
    if(!found_match) {
      if(typeof(this.error_handler) == 'undefined') {
        throw "scanner error at : "+input.substring(i,20);
      } else {
        this.error_handler(i);//input.substring(i,20)); 
      }
    }
  }
}

if(typeof(exports) != 'undefined') {
  exports.Scanner = Scanner;
}
