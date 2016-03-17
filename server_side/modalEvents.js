'use strict';

//const alerts = require('./alerts');
const utils = require('./utils.js');
const $ = jQuery;

var g_rowID = 0;
$('#send_coins_to').on('show.bs.modal', function () {
    $('.tableSendAddressGroup').empty();

    const network = $('#inputModalSendNetwork').val();
    const strCoinShortName = $('#spanModalFeeCoinName').text();
    function AddNewAddress()
    {
        $('.buttonPlusAddressForSendTo').remove();

        //var group = $(
        //    '<div class="form-group divSendAddressGroupItem">'+
        //        '<label for="inputModalSendAddress" class="col-sm-2 control-label">Address</label></div>');
        //var container = $('<div class="display-table col-sm-9 divModalSendAddress"></div>');
        
        var inputAddr = $('<input type="text" class="form-control inputModalSendAddress">');
        
        var inputAmount = $('<input type="text" class="form-control" id="inputModalSendAmount" placeholder="0.0">');
        inputAmount[0].oninput = function() {
            var sendAmount = parseFloat($( this ).val());
            if (isNaN(sendAmount))
                sendAmount = 0.0;
                        
            var sendFee = parseFloat($( '#inputModalSendFee' ).val());
            if (isNaN(sendFee))
                sendFee = 0.0;
                    
            $('#spanModalBalance').text(utils.getSavedBalance(network)-sendAmount-sendFee+" " + strCoinShortName);
            
        }
        
        var btnAdd = $('<button type="button" class="btn btn-default buttonPlusAddressForSendTo" aria-label="Left Align"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button>');
        //btnAdd[0].onclick = AddNewAddress;
    
        const rowID = 'rowID' + g_rowID++;

        var btnDel = $('<button type="button" class="btn btn-default" aria-label="Left Align"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>');
        btnDel[0].onclick = function() {
            $("." + rowID).remove();
            $('.buttonPlusAddressForSendTo').remove();
            
            var rows = $('.tableSendAddressGroup').children();
            if (!rows.length) return;
            
            var colsLast = $(rows[rows.length-1]).children();
            if (colsLast.length != 4) return;
            
            $(colsLast[3]).append(btnAdd);
        };
        
        if (!$('.inputModalSendAddress').length)
        {
            $( ".tableSendAddressGroup" ).append($("<tr class='"+rowID+"'></tr>").append(
                $("<td></td>").append(inputAddr),
                $("<td></td>").append(inputAmount),
                $("<td></td>"),
                $("<td></td>").append(btnAdd)));
        }
        else
            $( ".tableSendAddressGroup" ).append($("<tr class='"+rowID+"'></tr>").append(
                $("<td></td>").append(inputAddr),
                $("<td></td>").append(inputAmount),
                $("<td></td>").append(btnDel),
                $("<td></td>").append(btnAdd)));
    }
    
    AddNewAddress();
})