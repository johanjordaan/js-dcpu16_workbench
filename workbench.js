load_font = function() {
  var font = [];
  var charWidth = 4, charHeight = 8;
  var charScale = 3;
  (function() {
    var fontCanvas = document.getElementById('fontCanvas'); 
    var fontCtx = fontCanvas.getContext('2d');
    var fontImage = new Image();
    fontImage.onload = function() {
      fontCtx.drawImage(fontImage, 0, 0);
      
      for(var i = 0; i < charWidth; i++) {
        for(var j = 0; j < 32; j++) {
          var fontData = fontCtx.getImageData(j * charWidth, i * charHeight, charWidth, charHeight),
            charId = (i * 32) + j;
            
          for(var k = 0; k < charWidth; k++) {
            var col = 0;
            for(var l = 0; l < charHeight; l++) {
              var pixelId = l * charWidth + k;
              col |= (((fontData.data[pixelId * charWidth + 1] > 128) * 1) << l);
            }
            font[(charId * 2) + Math.floor(k/2)] |= (col << (((k+1)%2) * charHeight));
          }
        }
      }
      copyFont();
    };
    fontImage.src = 'lib/font.png';
  })();
      
  function copyFont() {
    for(var i = 0; i < font.length; i++) {
      cpu.set_memory(0x8180 + i,font[i]);
    }
  };
}