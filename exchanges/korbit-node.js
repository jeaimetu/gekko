Skip to content
This repository
Search
Pull requests
Issues
Marketplace
Explore
 @jeaimetu
 Sign out
1
4 3 icemilo/korbit-node
 Code  Issues 1  Pull requests 0  Projects 0  Wiki  Insights
korbit-node/korbit.js
ca42941  on 25 Nov 2015
@icemilo icemilo Fixed nonce generator, some typos
     
251 lines (200 sloc)  6.72 KB
'use strict';

var needle = require('needle');
var _ = require('lodash');

/**
  * Korbit API wrapper
  * @param {String} clientID
  * @param {String} clientSecret
  * @param {String} userName
  * @param {String} userPassword
**/

class Korbit {

  constructor(clientID, clientSecret, userName, userPassword){
    if(_.isEmpty(clientID) || _.isEmpty(clientSecret) || _.isEmpty(userName) || _.isEmpty(userPassword)){
      throw new Error("Missing Parameters");
    }

    this.config = {
      url : process.env.NODE_ENV != "production" ? 'https://api.korbit-test.com/' : 'https://api.korbit.co.kr/',
      version : 'v1',
      timeoutMS : 18000
    };

    this.clientID = clientID;
    this.clientSecret = clientSecret;
    this.userName = userName;
    this.userPassword = userPassword;
  }

  /*
   * PUBLIC METHOD
   */

  ticker (isDetailed, callback){
    if(isDetailed == true)
      return this.requestPublicAPI('/ticker/detailed', callback);
    else
      return this.requestPublicAPI('/ticker', callback);
  }

  orderbook (params, callback){
    var parameters = {
      group : params.group ? params.group : true,
      category : params.group ? params.category : 'all'
    };

    return this.requestPublicAPI('/orderbook', parameters, callback);
  }

  transactions (params, callback){
    var parameters = {
      time : params.time ? params.time : 'hour'
    };

    return this.requestPublicAPI('/transactions', parameters, callback);
  }

  constants (callback){
    return this.requestPublicAPI('/constants', callback);
  }

  /*
   * PRIVATE METHOD
   */

  /* AUTH METHOD */
  authorize(callback) {
    return this.requestAuthAPI('/oauth2/access_token', callback);
  }

  refreshAccessToken(callback) {
    return this.requestAuthAPI('/oauth2/access_token', callback);
  }

  /* USER METHOD */
  getUserInfo (callback) {
    return this.requestPrivateAPI('GET', '/user/info', callback);
  }

  bidOrder (params, callback){
    return this.requestPrivateAPI('POST', '/user/orders/buy', params, callback);
  }

  askOrder (params, callback){
    return this.requestPrivateAPI('POST', '/user/orders/sell', params, callback);
  }

  cancelOrder(params, callback){
    return this.requestPrivateAPI('POST', '/user/orders/cancel', params, callback);
  }

  listOrders(callback){
    return this.requestPrivateAPI('GET', '/user/orders/open', callback);
  }

  transactionHistory(params, callback){
    return this.requestPrivateAPI('GET', '/user/transaction', callback);
  }


  /* FIAT METHOD */

  setVirtualBank(params, callback){
    return this.requestPrivateAPI('POST', '/user/fiats/address/assign', callback);
  }

  setBankAccount(params, callback){
    return this.requestPrivateAPI('POST', '/user/fiats/address/register', params, callback);
  }

  requestWithdrawal(params, callback){
    return this.requestPrivateAPI('POST', '/user/fiats/out', params, callback);
  }

  withdrawalStatus(callback){
    return this.requestPrivateAPI('GET', '/user/fiats/status', callback);
  }

  cancelWithdrawal(params, callback){
    return this.requestPrivateAPI('POST', '/user/fiats/out/cancel', params, callback);
  }


  /* WALLET METHOD */

  getWalletStatus(callback){
    return this.requestPrivateAPI('GET', '/user/wallet', callback);
  }

  assignWalletAddr(params, callback){
    return this.requestPrivateAPI('POST', '/user/conins/address/assign', params, callback);
  }

  requestBTCWithdrawal(params, callback){
    return this.requestPrivateAPI('POST', '/user/coins/out', params, callback);
  }

  btcWithdrawalStatus(callback){
    return this.requestPrivateAPI('GET', '/user/coins/status', callback);
  }

  cancelBTCWithdrawal(params, callback){
    return this.requestPrivateAPI('POST', '/user/coins/out/cancel', callback);
  }

  /*
   * UTILITY METHOD
   */

  generateNonce(){
    return new Date().getTime();
  }

  /*
   * Request method for public API
   */

  requestPublicAPI (path, params, callback){
    if(callback === undefined){
      callback = params;
    }

    needle.get(this.config.url + this.config.version + path, params, function(err, response){
      if(!err && response.statusCode == 200){
        return callback(null, response.body);
      } else {
        return callback(new Error(response.headers.warning), null);
      }
    });
  }

  /*
   * Request method for private API (with access token)
   */

  requestPrivateAPI (method, path, params, callback){
    if(callback === undefined){
      callback = params;
    }

    if(_.isEmpty(this.clientID) || _.isEmpty(this.clientSecret)){
      return callback(new Error("Credentials are not set."), null);
    }

    var options = {
      headers : {
        'Accept' : 'application/json',
        'Authorization' : _.isEmpty(this.accessToken) ? null : 'Bearer ' + this.accessToken
      }
    };

    if(method == 'GET'){
      needle.get(this.config.url + this.config.version + path + '?nonce=' + this.generateNonce(), options, function(err, response){
        if(!err && response.statusCode == 200){
          return callback(null, response.body);
        } else {
          return callback(new Error(response.headers.warning), null);
        }
      });
    } else {
      params.nonce = this.generateNonce();
      needle.post(this.config.url + this.config.version + path, params, function(err, response){
        if(!err && response.statusCode == 200 && response.status == 'success'){
          return callback(null, response.body);
        } else if(response.statusCode == 200 && response.status != 'success') {
          return callback(new Error(response.body.status), null);
        } else {
          return callback(new Error(response.headers.warning), null);
        }
      });
    }
  }

  /*
   * Request method for authentication APIs
   */

  requestAuthAPI (path, callback){
    var self = this;
    if(_.isEmpty(this.clientID) || _.isEmpty(this.clientSecret)){
      return callback(new Error("Credentials are not set."), null);
    } else {
      var body = {
        client_id : this.clientID,
        client_secret : this.clientSecret,
        username : this.userName,
        password : this.userPassword,
        grant_type : _.isEmpty(this.refreshToken) ? 'password' : 'refresh_token'
      };

      if(!_.isEmpty(this.refreshToken))
        body.refresh_token = this.refreshToken;

      needle.post(this.config.url + this.config.version + path, body, function(err, response){
        if(!err && response.statusCode == 200){
          self.refreshToken = response.body['refresh_token'];
          self.accessToken = response.body['access_token'];
          self.expires = new Date().getTime() + response.body['expires_in'];
          return callback(null, response.body);
        } else {
          return callback(new Error("Failed to authorize. " + response.headers.warning), null);
        }
      });
    }
  }
}

module.exports = Korbit;
© 2018 GitHub, Inc.
Terms
Privacy
Security
Status
Help
Contact GitHub
API
Training
Shop
Blog
About
