Debugger = function() {
  this.assembly = {};
  this.deassembly = {};
  this.cpu = new CPU();
}

Debugger.prototype.load = function(code_start,source) {
  // TODO : The assembly needs to take code_start into account
  this.assembly = assemble(source);
  this.code_start = code_start;

  this.reset();
}

Debugger.prototype.reset = function() {
  this.deassembly = deassemble(this.assembly.byte_code,this.assembly.labels);
  this.cpu.load(this.code_start,this.assembly.byte_code);
  this.current_line = this.code_start;
}

Debugger.prototype.step = function() {
  if(this.deassembly==null) return;
  for(var i=0;i<this.deassembly.lines[this.current_line].byte_code.length;i++) {
    this.cpu.step();
  }
  var tmp = 0;
  for(var i=0;i<this.deassembly.lines.length;i++) {
    if(this.cpu.pc==this.deassembly.lines[i].mem_pos) {   // TODO This will not work if you fiddle with the PC directly ...
      this.current_line = i;
      break;
    }
  }
}