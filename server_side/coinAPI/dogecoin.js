'use strict';

const utils = require('../utils.js');
const alerts = require('../alerts');
const $ = require('jquery');

//eb9e796f9a84f5c79e7fc59600bc3877
const token = '?token=eb9e796f9a84f5c79e7fc59600bc3877';

exports.netID = 0x1e;
exports.name = "dogecoin";
exports.Shortname = "DOGE";
exports.fee = 0.0001;

exports.getBalance = function(arrayAddr, callback)
{
    var addrs = "";
    arrayAddr.forEach(function(addr, i, array) {
        if (i < array.length-1) addrs += addr + ";";
        else addrs += addr;
    });
    
    console.log("GetBalance "+exports.Shortname+" param: "+addrs);
    $.getJSON( 'https://api.blockcypher.com/v1/doge/main/addrs/'+addrs+'/balance' + token, function(data) {
        data = [].concat(data);
        data.forEach(function(element) {
            element.balance = (parseFloat(element.balance)/100000000.0).toFixed(8);
        });
        callback({status: 'success', data: data});
    })
    .fail(function(e) {
        console.log((e && e.message) ? e.message : JSON.stringify(e));
        callback(utils.JSONreturn('false', 'error'));
    });      

};

exports.pushTransaction = function(hexTX, callback)
{
    var pushtx = {
      tx: hexTX
    };
//    console.log('pushTransaction' + hexTX);
 //   alert(hexTX)
    $.post( 'https://api.blockcypher.com/v1/doge/main/txs/push', JSON.stringify(pushtx))
      .done(function( data ) {
        callback(utils.JSONreturn('success', {txHash: data.tx.hash}));
      })
      .fail(function(e) {
        //alert( "error " + JSON.stringify(e));
        alerts.OnTransactionSent(e);
      });   
};

exports.getTransactions = function(arrayAddr, callback)
{
    var addrs = "";
    arrayAddr.forEach(function(addr, i, array) {
        if (i < array.length-1) addrs += addr + ";";
        else addrs += addr;
    });

    $.getJSON( 'https://api.blockcypher.com/v1/doge/main/addrs/'+addrs + token + "&confirmations=0", function(data) {
        data = [].concat(data);
        data.forEach(function(element) {
            element.balance = (parseFloat(element.balance)/100000000.0).toFixed(8);
            element.txs = element.txrefs || [];
            element.txs.forEach(function(tx) {
                tx.tx = tx.tx_hash;
                tx.time_utc = tx.confirmed;
                tx.amount = (parseFloat(tx.value)/100000000.0).toFixed(8);
                if (tx.tx_output_n < 0)
                    tx.amount = -1.0*tx.amount;
            });
        });
        callback(exports.netID, data);
        
        /*$.getJSON( urlAPI + "unconfirmed/" + arrayAddr.toString(), function(data2) {
            callback(exports.netID, data2.data);
        }).fail(function() {
            callback(exports.netID, utils.JSONreturn(false, 'error'));
        }); */     
    }).fail(function() {
        callback(exports.netID, utils.JSONreturn(false, 'error'));
    });   
    
}

exports.getUnspentTransactions = function(arrayAddr, callback)
{
    var addrs = "";
    arrayAddr.forEach(function(addr, i, array) {
        if (i < array.length-1) addrs += addr + ";";
        else addrs += addr;
    });

    $.getJSON( 'https://api.blockcypher.com/v1/doge/main/addrs/'+addrs + token + '&unspentOnly=true', function(data) {
        data = [].concat(data);
        data.forEach(function(element) {
            element.unspent = element.txrefs || [];
            element.unspent.forEach(function(tx) {
                tx.tx = tx.tx_hash;    
                tx.amount = (parseFloat(tx.value)/100000000.0).toFixed(8);
                tx.n = tx.tx_output_n;
            });
        }); 
        callback(exports.netID, {status: 'success', data: data});
    }).fail(function(e) {
        console.log("getUnspentTransactions fail e=" + (e&&e.message?e.message:'null'));
        callback(exports.netID, utils.JSONreturn('false', 'error'));    
    });
};

exports.CheckFee = function(hexTX, fee)
{
    var bRet = true;
    const fRecommended = exports.fee/(1+hexTX.length/(2*1024));
    if (parseFloat(fee) < fRecommended)
    {
        bRet = false;
        alerts.Alert('Warning', 'Your transaction fee is too small (recommended "'+fRecommended +'")<BR>Push transaction anyway (press OK button) ?', function() {bRet = true;});
    }

    return bRet;        
}

exports.CheckHexTransaction = function(hex) {return hex;};
exports.GetOutTxAmount = function(amount) {return parseInt(parseFloat(amount)/0.00000001);};
