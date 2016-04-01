'use strict';

//const alerts = require('./alerts');
const utils = require('./utils.js');
const $ = jQuery;

var g_rowID = 0;

function MakeInputAddress(network)
{
    var jsonSavedPublicKeys = utils.getItem("PublicKeys").value || {}; 

    var aAddress = [];
    for (var key in jsonSavedPublicKeys)
    {
        if (network.localeCompare(jsonSavedPublicKeys[key].network + "") != 0)
            continue;
            
        aAddress.push(jsonSavedPublicKeys[key].address);
    }
    
    if (aAddress.length == 0)
        return "";
        
    var list = "";
    aAddress.forEach(function(addr){
        list += '<li><a href="#" class="aAddressToSendCoins">'+addr+'</a></li>';
    });
    
    const idSpanAddress = "spanAddressTo" + g_rowID;
    
    var UL = $('<ul class="dropdown-menu " aria-labelledby="dropdownMenu'+g_rowID+'"></ul>').append(list);
    UL.children().click(function() {
        $('.'+idSpanAddress).text($(this).text());
    });
        
    var ret = 
            $('<div class="dropdown"></div>').append(
                '<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu'+g_rowID+'" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' + 
                  '<span class="spanAddressTo '+idSpanAddress+'">' + aAddress[0] + '</span>' + 
                  '<span class="caret"></span>' + 
                '</button>', 
                UL
                )
            ;
    return ret;
}

$('#send_coins_to').on('show.bs.modal', function () {
    $('.tableSendAddressGroup').empty();

    const network = $('#inputModalSendNetwork').val();
    const strCoinShortName = $('#spanModalFeeCoinName').text();
    function AddNewAddress()
    {
        $('.buttonPlusAddressForSendTo').remove();

        var inputAddr = MakeInputAddress(network); //$('<input type="text" class="form-control inputModalSendAddress">');
        
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
                $("<td style='overflow: visible!important'></td>").append(inputAddr),
                $("<td></td>").append(inputAmount),
                $("<td></td>"),
                $("<td></td>").append(btnAdd)));
        }
        else
            $( ".tableSendAddressGroup" ).append($("<tr class='"+rowID+"'></tr>").append(
                $("<td style='overflow: visible!important'></td>").append(inputAddr),
                $("<td></td>").append(inputAmount),
                $("<td></td>").append(btnDel),
                $("<td></td>").append(btnAdd)));
    }
    
    AddNewAddress();
})