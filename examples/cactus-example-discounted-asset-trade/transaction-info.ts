/*
 * Copyright 2020-2022 Hyperledger Cactus Contributors
 * SPDX-License-Identifier: Apache-2.0
 *
 * transaction-info.ts
 */

import { RequestInfo } from "@hyperledger/cactus-cmd-socket-server";

export class TransactionInfo {
  businessLogicID = "";
  tradeID = "";
  ethereumAccountFrom = "";
  ethereumAccountTo = "";
  ethereumAccountFromKey = "";
  ethereumAccountToKey = "";
  fabricAccountFrom = "";
  fabricAccountTo = "";
  fabricAccountFromKey = "";
  fabricAccountToKey = "";
  tradingValue = "";
  assetID = "";
  status = 0;
  escrowLedger = "";
  escrowTxID = "";
  escrowTxInfo = "";
  transferLedger = "";
  transferTxID: string | null = "";
  transferTxInfo = "";
  settlementLedger = "";
  settlementTxID = "";
  settlementTxInfo = "";

  constructor() {
    // Do nothing
  }

  setRequestInfo(mode: number, requestInfo: RequestInfo): void {
    // Set request information
    this.businessLogicID = requestInfo.businessLogicID;
    this.tradeID = requestInfo.tradeID;
    this.ethereumAccountFrom = requestInfo.tradeInfo.ethereumAccountFrom;
    this.ethereumAccountTo = requestInfo.tradeInfo.ethereumAccountTo;
    this.fabricAccountFrom = requestInfo.tradeInfo.fabricAccountFrom;
    this.fabricAccountTo = requestInfo.tradeInfo.fabricAccountTo;
    this.tradingValue = requestInfo.tradeInfo.tradingValue;
    this.assetID = requestInfo.tradeInfo.assetID;

    // mode check
    if (mode === 0) {
      // init mode
      // Initialize anything other than request information
      this.status = null;
      this.escrowLedger = null;
      this.escrowTxID = null;
      this.escrowTxInfo = null;
      this.transferLedger = null;
      this.transferTxID = null;
      this.transferTxInfo = null;
      this.settlementLedger = null;
      this.settlementTxID = null;
      this.settlementTxInfo = null;
    }
  }
}
