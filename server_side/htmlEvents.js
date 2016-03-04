'use strict';

const app = require('./app');
const bitcoin = require('bitcoinjs-lib');
const utils = require('./utils.js');    
const Firebase = require("firebase");
const crypto = require('crypto');

$(function() {
    $("#top_nav a").each(function(index) {
       $('#'+$(this).attr('open-id')).hide();
    });
    
    if ((!utils.getItem("KeyPairs").value || !Object.keys(utils.getItem("KeyPairs").value).length) && utils.isValidEncodePassword(""))
    {
        for (var key in utils.coinsInfo)
        {
            const network = bitcoin.networks[utils.coinsInfo[key][0]];
            const keyPair = bitcoin.ECPair.makeRandom({network : network});
           
            app.AddKeyPair(keyPair, "");
            break;
        }
    }

    app.RefreshKeyPairsBalance();
    app.UpdatePublicKeysTableHTML();
    app.RefreshEncodeWalletTab();
    
    $('#tab_trade_top').show();
});

$("#top_nav a").on("click", function(e){
    e.preventDefault();
    $("#top_nav").find(".active").removeClass("active");
    $(this).parent().addClass("active");
   
    $("#top_nav a").each(function(index) {
       $('#'+$(this).attr('open-id')).hide();
    });
    $('#'+$(this).attr('open-id')).show();
});

$('#submitSignMessage').click(function(e) {
    e.preventDefault();
    const password = $('#inputSignMessagePassword').val();
    
    const keyPair = utils.getKeyPairFromWIF(utils.getPrivateKey($('#inputPybKeyForSign').val(), password));
  
    if (!keyPair)
    {
        alert('Invalid private key or wallet password!');
        return;
    }
    
    console.log("keyPair.network="+JSON.stringify(keyPair.network));    
    $('#textSignature').val(bitcoin.message.sign(keyPair, $('#textForSign').val()).toString('base64'), keyPair.network);
});

$('#submitEncryptWallet').click(function(e){
    e.preventDefault();
    
    const savedPassword = utils.getSavedEncodePassword();
    const password = $('#inputEncryptPassword').val();
    
    $('#divEncryptPassword2').removeClass('has-error');
    if ((password.localeCompare($('#inputEncryptPassword2').val()) != 0 || !password.length ) && !savedPassword.length)
    {
        alert('Passwords do not match or empty');
        $('#divEncryptPassword2').addClass('has-error');
        return;
    }
    
    if (!savedPassword)
    {
        if (app.EncodeWallet(password))
            utils.setEncodePassword(password);
        else
            alert('Encode error!');
    }
    else
    {
        if (app.DecodeWallet(password))
            utils.setEncodePassword("");
        else
            alert('Decode error!');
    }

    app.UpdateKeyPairsTableHTML();
    app.RefreshEncodeWalletTab();
});

function onBackupOrRestore()
{
    const user= $('#inputBackupWalletLogin').val();
    const password = $('#inputBackupWalletPassword').val();
    
    $('#divBackupWalletLogin').removeClass('has-error');
    if (!user.length)
    {
        alert('Error: Wallet name is empty!');
        $('#divBackupWalletLogin').addClass('has-error');
        return 0;
    }
    
    $('#divBackupWalletPassword2').removeClass('has-error');
    if (password.localeCompare($('#inputBackupWalletPassword2').val()) != 0 || !password.length )
    {
        alert('Error: Passwords do not match or empty');
        $('#divBackupWalletPassword2').addClass('has-error');
        return 0;
    }
    
    const myFirebaseRef = new Firebase("https://dazzling-inferno-2292.firebaseio.com/");

    const uid = crypto.createHash("sha256")
                           .update(user+password)
                           .digest('hex');
    
    try {
        return {"ref" : myFirebaseRef.child("users/"+uid ), "uid" : uid};
    }                       
    catch(e){
        alert(e.message);
        return 0;
    }
    
}

$('#submitBackup').click(function(e){
    e.preventDefault();
    
    const savedPassword = utils.getSavedEncodePassword();
    
    if (!savedPassword.length)
    {
        alert("Error: You can not save decoded wallet!");

        $('.nav-tabs a[href="#tab_encrypt_wallet"]').tab('show');
        
        return;
    }
    
    const db = onBackupOrRestore();
    if (!db) return;
    
    var jsonSavedKeyPairs = utils.getItem("KeyPairs").value || {};
    
    for (var key in jsonSavedKeyPairs)
        jsonSavedKeyPairs[key].txs = [];

    db.ref.set({
	  uid: db.uid,
	  keypairs: jsonSavedKeyPairs,
	  pubkeys: utils.getItem("PublicKeys").value || {},
	  security: utils.getItem("Security").value || {}
    }, function(error) {
        if (error) {
            alert("Data could not be saved." + error);
        } else {
            alert("Data saved successfully.");
        }        
    });
});

$('#submitRestore').click(function(e){
    e.preventDefault();
    
    const db= onBackupOrRestore();
    if (!db) return;

    db.ref.once("value", function(snapshot) {
        utils.setItem("KeyPairs", snapshot.val().keypairs);
        utils.setItem("PublicKeys", snapshot.val().pubkeys);
        utils.setItem("Security", snapshot.val().security);
        
        app.RefreshKeyPairsBalance();
        app.UpdatePublicKeysTableHTML();
        app.RefreshEncodeWalletTab();
        
        alert("Data restored successfully.");
    }, function (errorObject) {
        alert("The read failed: " + errorObject.code);
    });
    
});

$('#submitSignMessageVerify').click(function(e) {
    e.preventDefault();
    
    const address = $("#inputPybKeyForSignVerify").val();
    const addrType = parseInt(utils.get_address_type($('#inputPybKeyForSign').val()), 16);
    const networkName = utils.coinsInfo[addrType][0];
    const network = bitcoin.networks[networkName];
    
    console.log("address="+address+";  addrType="+addrType+"; networkName="+networkName+"; \nnetwork="+JSON.stringify(network));
    
    const result = bitcoin.message.verify(address, $('#textSignatureVerify').val(), $('#textForSignVerify').val(), network);
    
    if (result)
        alert("coin:" + networkName+ " message Verify OK");
    else
        alert("coin:" + networkName+ " message Verify FALSE");
});

$('#tab_trade_top a').click(function () {
    if (this.hash.localeCompare('#tab_transactions') == 0)
    {
        utils.updateTransactions(app.UpdateTransactionsTableHTML);
    }
});


$('#btnPrivateKeyReady').click(function (e) {
    e.preventDefault();
    
    jQuery('#add_private_key').modal('hide');
    const password = $('#inputNewPivateKeyPassword').val();
  
    if (!utils.isValidEncodePassword(password))
    {
        alert('Invalid wallet password!');
        return false;
    }

    const keyPair = utils.getKeyPairFromWIF($('#inputNewPivateKey').val());
  
    if (!keyPair)
        return;
  
    app.AddKeyPair(keyPair, password);
});

$('#btnNewKeyPairReady').click(function (e) {
    e.preventDefault();
    
    jQuery('#add_new_keypair').modal('hide');
    const password = $('#inputNewKeyPairPassword').val();
    
    if (!utils.isValidEncodePassword(password))
    {
        alert('Invalid wallet password!');
        return false;
    }
        
    const network = bitcoin.networks[$( "#add_new_keypair  input:checked" ).val()];
    
    console.log('creating network: ' + network);
    const keyPair = bitcoin.ECPair.makeRandom({network : network});
   
    app.AddKeyPair(keyPair, password);
});

$('#btnPublicKeyReady').click(function () {
    jQuery('#add_new_address').modal('hide');
    
    app.AddPublicKey($('#inputNewPublicKey').val(), $('#inputNewPublicKeyLabel').val());
    

});

//browserify ~/workspace/server_side/htmlEvents.js -s htmlEvents > ~/workspace/site/js/wallet.js