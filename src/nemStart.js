#!/usr/bin/env node
/** @module nemStart.js */
'use strict';
require('dotenv').config();
const logger = require('./utils/logger');
const nemService = require('./services/nemService');
const dbService = require('./services/dbServices');

function init() {
    dbService.dbConnect().then(async () => {
        let accounts = await dbService.getAccounts('NEM');
        let addresses = [];
        accounts.forEach((account) => {
            account.addresses.forEach((address) => {
                if(address.protocol === 'NEM') {
                    addresses.push(address);
                }
            });
        });
        nemService.connect();
        nemService.subscribePendingTxn(addresses);
        nemService.subscribeNewBlock();
    });
}
init();