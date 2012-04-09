fs = require('fs');
ejs = require('ejs')

cpu_constants = require('../lib/cpu_constants');

render = function(template,params,destination) {
  t = fs.readFileSync(template,'utf8') ;
  tr = ejs.render(t,params);
  fs.writeFileSync(destination,tr);
}

C = function(op,a,b){
  return '0x'+(op | (a<<4) | (b<<10)).toString(16);
}

render('test/assembler.test.gen.ejs',{cpu_constants:cpu_constants},'test/assembler.test.gen.js'); 

for(var op in cpu_constants.operations) {
  render('test/assembler.testcases.ejs',{cpu_constants:cpu_constants,op:cpu_constants.operations[op]},'test/assembler.'+op+'.testcases.dat');
}

