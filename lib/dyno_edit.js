// Usage :
//  $('.editable').click(dyno(function(id,val) { alert(id+' '+val);} ));
//  $('.memory_editable').click(dyno(function(id) { alert('Memory '+id+' '+val);} ));
//

dyno = function(f) {
  return function(event) {
    $(this).off('click');
    var val = $(this).html();
    $(this).html('<input id="dyno_edit" type="text" value="'+val+'"/>');    
    $('#dyno_edit').focus();
    $('#dyno_edit').blur( function(event) {
      var new_val = $(this).val();
      f($(this).parent().attr('id'),new_val);
      $(this).parent().click(dyno(f));
      $(this).parent().html(new_val); 
    });
  }
}