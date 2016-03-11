'use strict';

const bitcoin = require('bitcoinjs-lib');
const utils = require('./utils.js');
const $ = require('jquery');

exports.onOpenDialog = function(network, address, strLabel, strCoinShortName)
{
    $('.spanModalSendAddress')[0].textContent = address;
    $('#inputModalSendAddressLabel').val(strLabel);
    $('#spanModalAmountCoinName').text(strCoinShortName);
    $('#spanModalFeeCoinName').text(strCoinShortName);
    $('#spanModalBalance').text(utils.getSavedBalance(network)+" " + strCoinShortName);
            
    $('#inputModalSendNetwork').val(network);
    
    $( "#inputModalSendAmount" ).on('input', function() {
        var sendAmount = parseFloat($( this ).val());
        if (isNaN(sendAmount))
            sendAmount = 0.0;
                    
        var sendFee = parseFloat($( '#inputModalSendFee' ).val());
        if (isNaN(sendFee))
            sendFee = 0.0;
                
        $('#spanModalBalance').text(utils.getSavedBalance(network)-sendAmount-sendFee+" " + strCoinShortName);
    });
            
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
};

$('#btnSendCoinsReady').click(function () {
    const addressSendTo = $('.spanModalSendAddress')[0].textContent;
    const password = $('#inputSendMoneyPassword').val();
    
    if (utils.getSavedEncodePassword().length && !utils.isValidEncodePassword(password))
    {
        console.log('Invalid send password: ' + password);
        alert('Invalid password!');
        return;
    }
    
    jQuery('#send_coins_to').modal('hide');

    const sendAmount = parseFloat($( "#inputModalSendAmount" ).val());
    if (isNaN(sendAmount) || sendAmount <= 0)
    {
        alert('ERROR: bad send amount');
        return;
    }
    
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
        
        const networkCurrent = bitcoin.networks[utils.coinsInfo[network][0]];
        
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
           
                /*new_transaction.addInput(element.unspent[0].tx, element.unspent);
                //new_transaction.sign(txIndex++, keyPair);
                //mapIndexToPrivateKey[txIndex++] = keyPair;
                
                //current_amount  += parseFloat(element.unspent[0].amount);
                new_transaction.addOutput(addressSendTo, parseInt(element.unspent[0].amount/0.00000001));
                
                new_transaction.sign(0, keyPair);
                
                utils.pushTransaction(network, new_transaction.build().toHex());
                return;*/
            
            for (var i=0; i<element.unspent.length; i++)
            {
                if (!address_for_change.length)
                    address_for_change = element.address;
                    
                new_transaction.addInput(element.unspent[i].tx, element.unspent[i].n);
                //new_transaction.sign(txIndex++, keyPair);
               // mapIndexToPrivateKey[txIndex++] = keyPair;
                aSignArray.push(keyPair);

                current_amount += parseFloat(element.unspent[i].amount);
                if (current_amount >= sendAmount+sendFee)
                {
                    //console.log("current_amount >= sendAmount+sendFee: " + current_amount + " >= " + sendAmount+sendFee);
                    break;
                }
            }
            if (current_amount >= sendAmount+sendFee)
                break;
        }
        console.log('current_amount='+current_amount);
        
       // privateKeys.forEach(function(element) {
       //     new_transaction.addInput(element.tx, 0);
       // });
        
        //Output
        var fRealSendAmount = parseFloat(sendAmount);
        if (fRealSendAmount > current_amount)
            fRealSendAmount = current_amount;
            
        new_transaction.addOutput(addressSendTo, parseInt(fRealSendAmount/0.00000001));
        
        var fChange = parseFloat(current_amount) - fRealSendAmount - parseFloat(sendFee);
        if (fChange > 0.0 && address_for_change.length)
            new_transaction.addOutput(address_for_change, parseInt(fChange/0.00000001));

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