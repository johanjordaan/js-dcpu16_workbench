var ejs = require('ejs');

zero_fill = function( number, width ) {
  width -= number.toString().length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number;
}

show_cpu = function() {
  $('#cpu').html(ejs.render($('#cpu_template').html(),{cpu:cpu}));
  $('#current_pc').css('backgroundColor', 'yellow');
}