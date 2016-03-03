'use strict';

exports.OnTransactionSent = function(result)
{
    var responce = result;
    if (result.responseJSON)
        responce = result.responseJSON;
        
    var title = "Success!";
    if (!responce || !responce.status || responce.status != 'success')
    {
        title = "Failed!"
    }
    
    var message1 = "";
    if (responce.data)
        message1 = responce.data;
    
    var message2 = "";
    if (responce.message)
        message2 = responce.message;
    
    const $html = $(
        '<div class="modal fade" id="OnTransactionSent" tabindex="-1" role="dialog" aria-labelledby="OnTransactionSentLabel">'+
          '<div class="modal-dialog" role="document">'+
            '<div class="modal-content">'+
              '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
                '<h4 class="modal-title" id="OnTransactionSentLabel">'+title+'</h4>'+
              '</div>'+
              '<div class="modal-body">'+
                '<div>'+message1 +'<br>'+message2+'<br>Note, that push TX has an active limit of 5 API requests per minute.</div>'+
              '</div>'+
              '<div class="modal-footer">'+
                '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'+
             '</div>'+
            '</div>'+
          '</div>'+
        '</div>'
    );
    
    $('#OnTransactionSent').remove();
    
    $( "body" ).append($html);
    
    if (title == "Failed!")
    {
        $('#OnTransactionSentLabel').addClass('');
    }
    
    jQuery('#OnTransactionSent').modal('show');    
};