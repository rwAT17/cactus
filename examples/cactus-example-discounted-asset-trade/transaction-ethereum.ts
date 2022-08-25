/*
 * Copyright 2020-2022 Hyperledger Cactus Contributors
 * SPDX-License-Identifier: Apache-2.0
 *
 * transaction-ethereum.ts
 */

import {
  ConfigUtil,
  LPInfoHolder,
  TransactionSigner,
} from "@hyperledger/cactus-cmd-socket-server";

import {
  VerifierFactory,
  VerifierFactoryConfig,
} from "@hyperledger/cactus-verifier-client";

// const ethJsCommon = require("ethereumjs-common").default;
// const ethJsTx = require("ethereumjs-tx").Transaction;
// const libWeb3 = require("web3");

// const fs = require("fs");
// const path = require("path");
// const yaml = require("js-yaml");
//const config: any = JSON.parse(fs.readFileSync("/etc/cactus/default.json", 'utf8'));
const config: any = ConfigUtil.getConfig();
import { getLogger } from "log4js";
const moduleName = "TransactionEthereum";
const logger = getLogger(`${moduleName}`);
logger.level = config.logLevel;

const mapFromAddressNonce: Map<string, number> = new Map();
const xConnectInfo = new LPInfoHolder();
const verifierFactory = new VerifierFactory(
  xConnectInfo.ledgerPluginInfo as VerifierFactoryConfig,
  config.logLevel,
);

export function makeRawTransaction(txParam: {
  fromAddress: string;
  fromAddressPkey: string;
  toAddress: string;
  amount: number;
  gas: number;
}): Promise<{
  data: { serializedTx: string; [k: string]: string };
  txId: string;
}> {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(`makeRawTransaction: txParam: ${JSON.stringify(txParam)}`);

      getNewNonce(txParam.fromAddress).then((result) => {
        logger.debug(
          `##makeRawTransaction(A): result: ${JSON.stringify(result)}`,
        );

        const txnCountHex: string = result.txnCountHex;

        const rawTx: {
          nonce: string;
          to: string;
          value: number;
          gas: number;
        } = {
          nonce: txnCountHex,
          to: txParam.toAddress,
          value: txParam.amount,
          gas: txParam.gas,
        };
        logger.debug(
          `##makeRawTransaction(B), rawTx: ${JSON.stringify(rawTx)}`,
        );

        const signedTx: {
          serializedTx: string;
          txId: string;
        } = TransactionSigner.signTxEthereum(rawTx, txParam.fromAddressPkey);
        const resp: {
          data: { serializedTx: string };
          txId: string;
        } = {
          data: { serializedTx: signedTx["serializedTx"] },
          txId: signedTx["txId"],
        };

        return resolve(resp);
      });
    } catch (err) {
      logger.error(err);
      return reject(err);
    }
  });
}

function getNewNonce(fromAddress: string): Promise<{ txnCountHex: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(`getNewNonce start: fromAddress: ${fromAddress}`);

      // Get the number of transactions in account
      const contract = {}; // NOTE: Since contract does not need to be specified, specify an empty object.
      const method = { type: "function", command: "getNonce" };
      const template = "default";
      const args = { args: { args: [fromAddress] } };

      logger.debug(`##getNewNonce(A): call validator#getNonce()`);

      verifierFactory
        .getVerifier("84jUisrs")
        .sendSyncRequest(contract, method, args)
        .then((result) => {
          // logger.debug(`##getNewNonce(A): result: ${JSON.stringify(result)}`);

          let txnCount: number = result.data.nonce;
          let txnCountHex: string = result.data.nonceHex;

          const latestNonce = getLatestNonce(fromAddress);
          // logger.debug(`##getNewNonce(B): fromAddress: ${fromAddress}, txnCount: ${txnCount}, latestNonce: ${latestNonce}`);
          if (txnCount <= latestNonce) {
            // nonce correction
            txnCount = latestNonce + 1;
            logger.debug(
              `##getNewNonce(C): Adjust txnCount, fromAddress: ${fromAddress}, txnCount: ${txnCount}, latestNonce: ${latestNonce}`,
            );

            const method = { type: "function", command: "toHex" };
            const args = { args: { args: [txnCount] } };

            logger.debug(`##getNewNonce(D): call validator#toHex()`);
            verifierFactory
              .getVerifier("84jUisrs")
              .sendSyncRequest(contract, method, args)
              .then((result) => {
                txnCountHex = result.data.hexStr;
                logger.debug(`##getNewNonce(E): txnCountHex: ${txnCountHex}`);

                // logger.debug(`##getNewNonce(F) _nonce: ${txnCount}, latestNonce: ${latestNonce}`);
                setLatestNonce(fromAddress, txnCount);

                return resolve({ txnCountHex: txnCountHex });
              });
          } else {
            // logger.debug(`##getNewNonce(F) _nonce: ${txnCount}, latestNonce: ${latestNonce}`);
            setLatestNonce(fromAddress, txnCount);

            logger.debug(`##getNewNonce(G): txnCountHex: ${txnCountHex}`);
            return resolve({ txnCountHex: txnCountHex });
          }
        });
    } catch (err) {
      logger.error(err);
      return reject(err);
    }
  });
}

function getLatestNonce(fromAddress: string): number {
  if (mapFromAddressNonce.has(fromAddress)) {
    return mapFromAddressNonce.get(fromAddress);
  }
  //return 0;
  return -1;
}

function setLatestNonce(fromAddress: string, nonce: number): void {
  mapFromAddressNonce.set(fromAddress, nonce);
}
