Debugger = function(cpu) {
  if(typeof(cpu) == 'undefined') {
    this.cpu = new CPU();
  } else {
    this.cpu = cpu;
  }
    
  this.assembly = {};
  this.deassembly = {};
  this.breakpoints = [];
  this.run_delay = 500;
}

Debugger.prototype.load = function(code_start,source) {
  // TODO : The assembly needs to take code_start into account
  this.assembly = assemble(source);
  this.code_start = code_start;

  this.reset();
}

Debugger.prototype.reset = function() {
  this.deassembly = deassemble(this.assembly.byte_code,this.assembly.labels);
  this.cpu.reset();
  this.cpu.load(this.code_start,this.assembly.byte_code);
  this.current_line = this.code_start;
  this.paused = true;
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

Debugger.prototype.pause = function() {
  this.paused = true;
}

Debugger.prototype.run_next_step = function(on_step) {
  if(!this.paused) {
    this.step();
    on_step();
    if(this.breakpoints.indexOf(this.deassembly.lines[this.current_line].mem_pos)!=-1)  {
      this.paused = true;
      return;
    }
    var self = this;
    setTimeout(function() { self.run_next_step(on_step) },self.run_delay);
  }
}

Debugger.prototype.run = function(on_step) {
  this.paused = false;
  this.run_next_step(on_step);
}

Debugger.prototype.toggle_breakpoint = function(position) {
  position = parseInt(position);
  var index = this.breakpoints.indexOf(position);
  if(index == -1) {
    this.breakpoints.push(position);
  } else {
    this.breakpoints = this.breakpoints.splice(index,0);
  }
}

if(typeof(exports) != 'undefined') {
  exports.Debugger = Debugger;
} 
