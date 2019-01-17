#!/usr/bin/env node
/** @module nemStart.js */
'use strict';
require('dotenv').config();
const logger = require('./utils/logger');
const nemService = require('./services/nemService');
const dbService = require('./services/dbServices');

function init() {
    dbService.dbConnect().then(async () => {
        let addresses = await dbService.getAccounts('NEM');
        nemService.connect().then(() => {
            nemService.subscribePendingTxn(addresses);
            nemService.subscribeNewBlock();
        });
    });
}
init();