'use strict';

const bitcoin = require('multicoinjs-lib');
const utils = require('./utils.js');
const $ = require('jquery');

exports.onOpenDialog = function(network, address, strLabel, strCoinShortName)
{
    $('#inputModalSendAddressLabel').val(strLabel);
    $('#spanModalAmountCoinName').text(strCoinShortName);
    $('#spanModalFeeCoinName').text(strCoinShortName);
    $('#spanModalBalance').text(utils.getSavedBalance(network)+" " + strCoinShortName);
            
    $('#inputModalSendNetwork').val(network);
    $('#inputModalSendAddress').val(address);
    
    $( "#inputModalSendFee" ).on('input', function() {
        var sendFee = parseFloat($( this ).val());
        if (isNaN(sendFee))
            sendFee = 0.0;
                
        var sendAmount = parseFloat($( "#inputModalSendAmount" ).val());
        if (isNaN(sendAmount))
            sendAmount = 0.0;

        $('#spanModalBalance').text(utils.getSavedBalance(network)-sendAmount-sendFee+" " + strCoinShortName);
    });
            
    var sendAmount = parseFloat($( "#inputModalSendAmount" ).val());
    if (isNaN(sendAmount))
        sendAmount = 0.0;
    var sendFee = parseFloat($( '#inputModalSendFee' ).val());
    if (isNaN(sendFee))
        sendFee = 0.0;
                
    $('#spanModalBalance').text(utils.getSavedBalance(network)-sendAmount-sendFee+" " + strCoinShortName);
                
    jQuery('#send_coins_to').modal('show');
   
//    $('.inputModalSendAddress')[0].textContent = address;
//    $('.ulAddress')[0].innerHTML = '';
};

$('#btnSendCoinsReady').click(function () {
    const password = $('#inputSendMoneyPassword').val();
    if (utils.getSavedEncodePassword().length && !utils.isValidEncodePassword(password))
    {
        console.log('Invalid send password: ' + password);
        alert('Invalid password!');
        return;
    }
    jQuery('#send_coins_to').modal('hide');
    
    var rowSentInfo = [];
    var dFullSentAmount = 0.0;
    for (var i=0; i<$('.rowAddressSendTo').length; i++)
    {
        const row = $('.rowAddressSendTo')[i];
        const sendAmount = parseFloat($(row).find('#inputModalSendAmount').val());
        if (isNaN(sendAmount) || sendAmount <= 0)
        {
            alert('ERROR: bad send amount');
            return;
        }
        dFullSentAmount += sendAmount;
        
        rowSentInfo.push({addressSendTo : $(row).find('.spanAddressTo').text(), sendAmount : sendAmount});
    }

    /*const addressSendTo = $('.spanAddressTo')[0].textContent;

    const sendAmount = parseFloat($( "#inputModalSendAmount" ).val());
    if (isNaN(sendAmount) || sendAmount <= 0)
    {
        alert('ERROR: bad send amount');
        return;
    }*/
    
    var sendFee = parseFloat($( '#inputModalSendFee' ).val());
    if (isNaN(sendFee) || sendFee < 0)
        sendFee = 0.0;
    
    const network = $('#inputModalSendNetwork').val();
    var jsonSavedKeyPairs = utils.getItem("KeyPairs").value || {}; 

    var addresses = [];
    for (var key in jsonSavedKeyPairs)
    {
        if (utils.coinsInfo[jsonSavedKeyPairs[key].network] != utils.coinsInfo[network])
            continue;
            
        if (parseFloat(jsonSavedKeyPairs[key].balance) <= 0.0)
            continue;
            
        addresses.push(jsonSavedKeyPairs[key].address);
    }

    if (!addresses.length)
        return;
    
    utils.getUnspentTransactions(network, addresses, function(netID, data) {
        if (data.status.localeCompare('success') != 0)
            return;
        
        const networkCurrent = bitcoin.networks[utils.coinsInfo[network].name];
        
        var new_transaction = new bitcoin.TransactionBuilder(networkCurrent);
        
        //Inputs
        var address_for_change = "";
        var current_amount = 0.0;
        var aSignArray = [];
        //var mapIndexToPrivateKey = {};
        //var txIndex = 0;
        //console.log('data.data='+JSON.stringify([].concat(data.data)));
        var unspent = [].concat(data.data);
        for (var n=0; n<unspent.length; n++)
        {
            const element = unspent[n];

            console.log('element='+JSON.stringify(element));
           
            const keyPrivate = utils.getPrivateKey(element.address, password);
            const keyPair = bitcoin.ECPair.fromWIF(keyPrivate, networkCurrent);
           
            for (var i=0; i<element.unspent.length; i++)
            {
                if (!address_for_change.length)
                    address_for_change = element.address;
                    
                new_transaction.addInput(element.unspent[i].tx, element.unspent[i].n);

                aSignArray.push(keyPair);

                current_amount += parseFloat(element.unspent[i].amount);
                if (current_amount >= dFullSentAmount+sendFee)
                {
                    //console.log("current_amount >= sendAmount+sendFee: " + current_amount + " >= " + sendAmount+sendFee);
                    break;
                }
            }
            if (current_amount >= dFullSentAmount+sendFee)
                break;
        }
        console.log('current_amount='+current_amount);
        
        if (current_amount < dFullSentAmount+sendFee)
        {
            alert('ERROR: bad send amount!');
            return;
        }
        
       // privateKeys.forEach(function(element) {
       //     new_transaction.addInput(element.tx, 0);
       // });
        
        //Output
        var fRealSendAmount = 0.0;
        rowSentInfo.forEach(function(item){
            const amount = utils.coinsInfo[network].GetOutTxAmount(item.sendAmount);
            //new_transaction.addOutput(item.addressSendTo, parseInt(parseFloat(item.sendAmount)/0.00000001));
            new_transaction.addOutput(item.addressSendTo, amount);
            fRealSendAmount += parseFloat(item.sendAmount);
        });
        
        //var fRealSendAmount = parseFloat(sendAmount);
        if (fRealSendAmount > current_amount)
            fRealSendAmount = current_amount;
            
        //new_transaction.addOutput(addressSendTo, parseInt(fRealSendAmount/0.00000001));
        
        var fChange = parseFloat(current_amount) - fRealSendAmount - parseFloat(sendFee);
        if (fChange > 0.0 && address_for_change.length)
        {
            const amount = utils.coinsInfo[network].GetOutTxAmount(fChange);
           // new_transaction.addOutput(address_for_change, parseInt(fChange/0.00000001));
            new_transaction.addOutput(address_for_change, amount);
        }

        //Sign
        /*for (var index in mapIndexToPrivateKey)
        {
            //console.log('index='+index+);
            new_transaction.sign(parseInt(index), mapIndexToPrivateKey[index]);
        }*/
        for (var i=0; i<aSignArray.length; i++)
        {
            new_transaction.sign(i, aSignArray[i]);
        }
        
        utils.pushTransaction(network, new_transaction.build().toHex());
    });
});