'use strict';

const utils = require('../utils.js');
const alerts = require('../alerts');
const $ = require('jquery');

const urlAPI = "https://ppc.blockr.io/api/v1/address/";
const urlAPIpush = "https://ppc.blockr.io/api/v1/tx/push";

exports.netID = 0;
exports.name = "peercoin";
exports.Shortname = "PPC";

exports.getBalance = function(arrayAddr, callback)
{
    console.log('get balance ' + urlAPI + "balance/" + arrayAddr.toString() + "?confirmations=0");
    $.getJSON( urlAPI + "balance/" + arrayAddr.toString() + "?confirmations=0", function(data) {
        callback(data);
    })
      .fail(function() {
          callback(utils.JSONreturn(false, 'error'));
      });      
};

exports.pushTransaction = function(hexTX)
{
    console.log('pushTransaction' + hexTX);
   /* $.post( "https://bkchain.org/" + "ppc" + "/api/v1/tx/push", { "hex": hexTX })
      .done(function( data ) {
        alerts.OnTransactionSent(data);
      })
      .fail(function(e) {
        alerts.OnTransactionSent(e);
      });   */
      
    $.post("https://bkchain.org/" + "ppc" + "/api/v1/tx/push",
           JSON.stringify({ hexdata: hexTX }),
           function(data) {
             if (data === "exception") {
               //send_alert('alert-danger', '<strong>Error!</strong> Transaction failed!');
               alert('Error!');
             } else {
               //send_alert('alert-success', '<strong>Good!</strong> Transaction sent, id: <a href="' + script_name + '/tx/' + data + '" target="_blank">' + data + '</a>');
               alert('Success!');
             }
             
             // Wait a few seconds before refreshing balances
             //setTimeout(addressRefresh(), 2000);
           });
};

exports.getTransactions = function(arrayAddr, callback)
{
    $.getJSON( urlAPI  + "txs/" + arrayAddr.toString(), function(data) {
        callback(exports.netID, data.data);
        
        $.getJSON( urlAPI + "unconfirmed/" + arrayAddr.toString(), function(data2) {
            callback(exports.netID, data2.data);
        }).fail(function() {
            callback(exports.netID, utils.JSONreturn(false, 'error'));
        });      
    }).fail(function() {
        callback(exports.netID, utils.JSONreturn(false, 'error'));
    });   
    
}

exports.getUnspentTransactions = function(arrayAddr, callback)
{
    console.log('getUnspentTransactions: ' + urlAPI + "unspent/" + arrayAddr.toString());
    $.getJSON( urlAPI + "unspent/" + arrayAddr.toString(), function(data) {
        callback(exports.netID, data);
    })
      .fail(function() {
          callback(exports.netID, utils.JSONreturn(false, 'error'));
      });      
}
