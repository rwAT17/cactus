import // IPluginFactoryOptions,
// PluginFactory,
"@hyperledger/cactus-core-api";
import { sha256 } from "js-sha256";

import {
  //Checks,
  Logger,
  LoggerProvider,
  LogLevelDesc,
} from "@hyperledger/cactus-common";
import {
  IPluginWebService,
  IWebServiceEndpoint,
  ICactusPlugin,
  ICactusPluginOptions,
} from "@hyperledger/cactus-core-api";

// errors
import { RuntimeError } from "run-time-error";

import { Mutex } from "async-mutex";
import type { Express } from "express";

import {
  GatewayOptions,
  FabricApiClient,
} from "@hyperledger/cactus-plugin-ledger-connector-fabric";

import PostgresDatabaseClient from "./db-client/db-client";

import OAS from "../json/openapi.json";

//import { BlockTransactionObject } from "web3-eth"; //

export interface IPluginPersistenceFabricBlockOptions
  extends ICactusPluginOptions {
  gatewayOptions: GatewayOptions;
  apiClient: FabricApiClient;
  connectionString: string;
  logLevel: LogLevelDesc;
}

export class PluginPersistenceFabricBlock
  implements ICactusPlugin, IPluginWebService {
  private log: Logger;
  public static readonly CLASS_NAME = "PluginPersistenceFabricBlock";
  private dbClient: PostgresDatabaseClient;
  private readonly instanceId: string;
  private apiClient: FabricApiClient;
  private endpoints: IWebServiceEndpoint[] | undefined;
  private isConnected = false;
  private isWebServicesRegistered = false;

  private pushBlockMutex = new Mutex();
  private syncBlocksMutex = new Mutex();

  private failedBlocks = new Set<number>();

  // = > private lastSeenBlock = 0;
  private lastSeenBlock = 0;
  // Last Block in Ledger
  private lastBlock = 0;

  //check which blocks are missing
  private missedBlocks: string[] = [];
  private howManyBlocksMissing = 0;
  // connection
  //public fabricConnectorPlugin: PluginLedgerConnectorFabric;

  public ledgerChannelName = "mychannel";
  public ledgerContractName = "basic";
  // gateway options
  public gatewayOptions: GatewayOptions;

  constructor(public readonly options: IPluginPersistenceFabricBlockOptions) {
    const level = this.options.logLevel || "INFO";
    const label = PluginPersistenceFabricBlock.CLASS_NAME;
    this.log = LoggerProvider.getOrCreate({ level, label });
    this.instanceId = options.instanceId;
    this.gatewayOptions = options.gatewayOptions;
    // this.fabricConnectorPlugin = new PluginLedgerConnectorFabric(options);

    // database
    this.instanceId = options.instanceId;
    this.apiClient = options.apiClient;

    this.dbClient = new PostgresDatabaseClient({
      connectionString: options.connectionString,
      logLevel: level,
    });
  }

  public async shutdown(): Promise<void> {
    this.apiClient.close();
    await this.dbClient.shutdown();
    this.isConnected = false;
  }

  // public async getOrCreateWebServices(): Promise<IWebServiceEndpoint[]> {
  // const { log } = this;
  // const pkgName = this.getPackageName();
  // if (this.endpoints) {
  //   return this.endpoints;
  // }
  // this.log.info(`Creating web services for plugin ${pkgName}...`);
  // const endpoints: IWebServiceEndpoint[] = [];
  // {
  //   const endpoint = new StatusEndpointV1({
  //     connector: this,
  //     logLevel: this.options.logLevel,
  //   });
  //   endpoints.push(endpoint);
  // }
  // this.endpoints = endpoints;
  // this.log.info(`Instantiated web services for plugin ${pkgName} OK`, {
  //   endpoints,
  // });
  // return endpoints;
  // }

  // public async registerWebServices(
  //   app: Express,
  // ): Promise<IWebServiceEndpoint[]> {
  //   const webServices = await this.getOrCreateWebServices();
  //   webServices.forEach((ws) => ws.registerExpress(app));
  //   this.isWebServicesRegistered = true;
  //   return webServices;
  // }
  //
  //
  public getStatus(): any {
    return {
      instanceId: this.instanceId,
      connected: this.isConnected,
      webServicesRegistered: this.isWebServicesRegistered,
      lastSeenBlock: this.lastSeenBlock,
    };
  }

  /**
   * Get error cause for RuntimeError (instance of `Error`, string or undefined)
   * @param err unknown error type.
   * @returns valid `RuntimeError` cause
   */
  getRuntimeErrorCause(err: unknown): Error | string | undefined {
    if (err instanceof Error || typeof err === "string") {
      return err;
    }

    return undefined;
  }

  /**
   * Should be called before using the plugin.
   * Connects to the database and initializes the plugin schema and status entry.
   */

  public async onPluginInit(): Promise<void> {
    await this.dbClient.connect();
    this.log.info("Connect the PostgreSQL PostgresDatabaseClient");
    await this.dbClient.initializePlugin(
      PluginPersistenceFabricBlock.CLASS_NAME,
      this.instanceId,
    );
    this.log.info("Plugin initialized");
    this.isConnected = true;
  }

  public getInstanceId(): string {
    return this.instanceId;
  }

  public async helloWorldTest(): Promise<string> {
    return new Promise<string>((resolve) => {
      resolve("hello World test");
    });
  }

  public getPackageName(): string {
    return `@hyperledger/cactus-plugin-persistence-fabric-block`;
  }

  /**
   * Get OpenAPI definition for this plugin.
   * @returns OpenAPI spec object
   */
  public getOpenApiSpec(): unknown {
    return OAS;
  }

  /*/  public async onPluginInit(): Promise<void> {
   // await this.dbClient.connect();
   // await this.dbClient.initializePlugin(
    //  PluginPersistenceFabricBlock.CLASS_NAME,
    //////////////////////  this.instanceId,
    );
    this.isConnected = true;
  }*/

  public async registerWebServices(
    app: Express,
  ): Promise<IWebServiceEndpoint[]> {
    const webServices = await this.getOrCreateWebServices();
    webServices.forEach((ws) => ws.registerExpress(app));
    return webServices;
  }

  public async getOrCreateWebServices(): Promise<IWebServiceEndpoint[]> {
    const pkgName = this.getPackageName();

    if (this.endpoints) {
      return this.endpoints;
    }
    this.log.info(`Creating web services for plugin ${pkgName}...`);

    const endpoints: IWebServiceEndpoint[] = [];
    // {
    //   const options = { keyPairPem, consortiumRepo, plugin: this };
    //   const endpoint = new GetConsortiumEndpointV1(options);
    //   endpoints.push(endpoint);
    //   const path = endpoint.getPath();
    //   this.log.info(`Instantiated GetConsortiumEndpointV1 at ${path}`);
    // }
    this.endpoints = endpoints;

    this.log.info(`Instantiated web svcs for plugin ${pkgName} OK`, {
      endpoints,
    });
    return endpoints;
  }

  // Last block seen
  // change to public during migration
  public currentLastBlock(): number {
    return this.lastBlock;
  }
  // this is greatest  in number block migrated successfully to  database
  public currentLastSeenBlock(): number {
    return this.lastSeenBlock;
  }

  public isLastBlockGreatherThenLastSeen(): boolean {
    if (this.lastSeenBlock >= this.lastBlock) {
      return false;
    } else {
      return true;
    }
  }

  async lastBlockInLedger(): Promise<number> {
    let tempBlockNumber = this.lastBlock;
    let blockNumber = tempBlockNumber.toString();
    let block: any;
    let moreBlocks = true;
    do {
      try {
        block = await this.apiClient.getBlockV1({
          channelName: this.ledgerChannelName,
          gatewayOptions: this.gatewayOptions,
          query: {
            blockNumber,
          },
        });
      } catch (error) {
        this.log.info("Last block in ledger", tempBlockNumber - 1);
        moreBlocks = false;
      }
      this.log.warn(
        "getBlockV1 nr:",
        blockNumber,
        " response: ",
        JSON.stringify(block.data),
      );

      if (block.status == 200) {
        if (moreBlocks) {
          // Update information about last Block in Ledger - this.lastBlock
          this.lastBlock = tempBlockNumber;
          tempBlockNumber = tempBlockNumber + 1;
          blockNumber = tempBlockNumber.toString();
        }
      } else {
        moreBlocks = false;
      }
    } while (moreBlocks);
    return this.lastBlock;
  }

  // Synchronization of blocks

  async initialBlocksSynchronization(): Promise<string> {
    let tempBlockNumber = 0;
    let blockNumber = tempBlockNumber.toString();
    let block: any;
    let moreBlocks = true;
    do {
      try {
        block = await this.apiClient.getBlockV1({
          channelName: this.ledgerChannelName,
          gatewayOptions: this.gatewayOptions,
          query: {
            blockNumber,
          },
        });
      } catch (error) {
        this.log.info("Last block in ledger", tempBlockNumber - 1);
        moreBlocks = false;
      }

      if (block.status == 200) {
        const logBlock = JSON.stringify(block.data);

        this.log.warn("getBlockV1 response:", logBlock);

        // Put scrapped block into database
        this.log.info(logBlock);
        this.log.info("Block number: ", blockNumber);

        if (!this.isConnected) {
          await this.dbClient.connect();
          this.isConnected = true;
        }
        if (moreBlocks) {
          await this.migrateBlockNrWithTransactions(blockNumber);
          this.lastSeenBlock = tempBlockNumber;
          this.lastBlock = tempBlockNumber;
          tempBlockNumber = tempBlockNumber + 1;
          blockNumber = tempBlockNumber.toString();
          if (tempBlockNumber > 30) {
            moreBlocks = false;
          }
        }
      } else {
        moreBlocks = false;
      }
    } while (moreBlocks);
    return "done";
  }

  async continueBlocksSynchronization(): Promise<string> {
    let tempBlockNumber = this.lastSeenBlock;
    let blockNumber = tempBlockNumber.toString();
    this.lastBlock = await this.lastBlockInLedger();
    let block: any;
    let moreBlocks = true;
    do {
      try {
        block = await this.apiClient.getBlockV1({
          channelName: this.ledgerChannelName,
          gatewayOptions: this.gatewayOptions,
          query: {
            blockNumber,
          },
        });
      } catch (error) {
        this.log.info("Last block in ledger", tempBlockNumber - 1);
        moreBlocks = false;
      }
      this.log.warn(
        "getBlockV1 nr:",
        blockNumber,
        " response: ",
        JSON.stringify(block.data),
      );

      if (block.status == 200) {
        const tempBlockstep1 = JSON.stringify(block.data);
        const tempBlock = JSON.parse(tempBlockstep1);
        // Put scrapped block into database
        this.log.info(tempBlock);

        if (!this.isConnected) {
          await this.dbClient.connect();
          this.isConnected = true;
        }
        if (moreBlocks) {
          await this.migrateBlockNrWithTransactions(blockNumber);
          this.lastSeenBlock = tempBlockNumber;
          tempBlockNumber = tempBlockNumber + 1;
          blockNumber = tempBlockNumber.toString();
          if (tempBlockNumber > this.lastBlock) {
            moreBlocks = false;
          }
        }
      } else {
        moreBlocks = false;
      }
    } while (moreBlocks);
    return "done";
  }
  // NOTE: this function can loop into very long almost infinite loop or even
  // infinite loop depends on time of generating block < time writing to database
  async constinousBlocksSynchronization(): Promise<string> {
    let tempBlockNumber = this.lastSeenBlock;
    let blockNumber = tempBlockNumber.toString();
    this.lastBlock = await this.lastBlockInLedger();
    let block: any;
    let moreBlocks = true;
    do {
      try {
        block = await this.apiClient.getBlockV1({
          channelName: this.ledgerChannelName,
          gatewayOptions: this.gatewayOptions,
          query: {
            blockNumber,
          },
        });
      } catch (error) {
        this.log.info("Last block in ledger", tempBlockNumber - 1);
        moreBlocks = false;
      }
      this.log.warn(
        "getBlockV1 nr:",
        blockNumber,
        " response: ",
        JSON.stringify(block.data),
      );

      if (block.status == 200) {
        const tempBlockstep1 = JSON.stringify(block.data);
        const tempBlock = JSON.parse(tempBlockstep1);
        // Put scrapped block into database
        this.log.info(tempBlock);

        if (!this.isConnected) {
          await this.dbClient.connect();
          this.isConnected = true;
        }
        if (moreBlocks) {
          await this.migrateBlockNrWithTransactions(blockNumber);
          this.lastSeenBlock = tempBlockNumber;
          if (tempBlockNumber > this.lastBlock) {
            this.lastBlock = tempBlockNumber;
          }
          tempBlockNumber = tempBlockNumber + 1;
          blockNumber = tempBlockNumber.toString();
        }
      } else {
        moreBlocks = false;
      }
    } while (moreBlocks);
    return "done";
  }

  async getBlockFromLedger(blockNumber: string): Promise<any> {
    const block = await this.apiClient.getBlockV1({
      channelName: this.ledgerChannelName,
      gatewayOptions: this.gatewayOptions,
      query: {
        blockNumber,
      },
      skipDecode: false,
    });

    const tempBlockParse = block.data;
    this.log.warn(
      "getting block nr:",
      blockNumber,
      " with data: ",
      JSON.stringify(block.data),
    );
    return tempBlockParse;
  }

  // Migration of block nr with transaction inside
  // NOTE that each block have at least 1 transaction endorsement
  public async migrateBlockNrWithTransactions(
    blockNumber: string,
  ): Promise<boolean> {
    const block = await this.apiClient.getBlockV1({
      channelName: this.ledgerChannelName,
      gatewayOptions: this.gatewayOptions,
      query: {
        blockNumber,
      },
    });

    let tempBlockParse;
    this.log.warn(
      "inserting into database block nr:",
      blockNumber,
      " with data: ",
      ((tempBlockParse = JSON.parse(JSON.stringify(block.data))),
      JSON.stringify(block.data)),
    );

    const hash = Buffer.from(
      tempBlockParse.decodedBlock.header.data_hash.data,
    ).toString("hex");

    const block_data = {
      fabric_block_id: hash,
      fabric_block_num: Number(blockNumber),
      fabric_block_data: block.data,
    };
    if (!this.isConnected) {
      await this.dbClient.connect();
      this.isConnected = true;
    }

    // Put scrapped block into database
    const txLen = tempBlockParse.decodedBlock.data.data.length;
    if (txLen === 0) {
      return false;
    }
    for (let txIndex = 0; txIndex < txLen; txIndex++) {
      const txObj = tempBlockParse.decodedBlock.data.data[txIndex];
      const txStr = JSON.stringify(txObj);

      let txid = "";

      let endorser_signature = "";
      let payload_proposal_hash = "";
      let endorser_id_bytes = "";
      let end_mspid = "";
      let chaincode_proposal_input = "";
      let chaincode = "";
      let rwset;
      let readSet;
      let writeSet;
      let chaincodeID;
      let status;
      let tx_response = "";
      let creator_nonce = "";
      // add txIndex in block

      let envelope_signature = txObj.signature;
      if (envelope_signature !== undefined) {
        envelope_signature = Buffer.from(envelope_signature).toString("hex");
      }
      let payload_extension = txObj.payload.header.channel_header.extension;
      if (payload_extension !== undefined) {
        payload_extension = Buffer.from(payload_extension).toString("hex");
      }
      creator_nonce = txObj.payload.header.signature_header.nonce;
      if (creator_nonce !== undefined) {
        creator_nonce = Buffer.from(creator_nonce).toString("hex");
      }
      /* eslint-disable */
      const creator_id_bytes = txObj.payload.header.signature_header.creator.id_bytes.data.toString();
      if (txObj.payload.data.actions !== undefined) {
        chaincode =
          txObj.payload.data.actions[0].payload.action.proposal_response_payload
            .extension.chaincode_id.name;
        chaincodeID =
          txObj.payload.data.actions[0].payload.action.proposal_response_payload
            .extension;
        status =
          txObj.payload.data.actions[0].payload.action.proposal_response_payload
            .extension.response.status;
        this.log.info("rwser  :", JSON.stringify(rwset));
        rwset =
          txObj.payload.data.actions[0].payload.action.proposal_response_payload
            .extension.results.ns_rwset;

        if (rwset !== undefined) {
          readSet = rwset.reads;
          writeSet = rwset.writes;
        } else {
          readSet = " as usual ";
          writeSet = " as usual ";
        }

        chaincode_proposal_input =
          txObj.payload.data.actions[0].payload.chaincode_proposal_payload.input
            .chaincode_spec.input.args;
        if (chaincode_proposal_input !== undefined) {
          let inputs = "";
          for (const input of chaincode_proposal_input) {
            inputs =
              (inputs === "" ? inputs : `${inputs},`) +
              Buffer.from(input).toString("hex");
          }
          chaincode_proposal_input = inputs;
        }
        endorser_signature =
          txObj.payload.data.actions[0].payload.action.endorsements[0]
            .signature;
        if (endorser_signature !== undefined) {
          endorser_signature = Buffer.from(endorser_signature).toString("hex");
        }
        payload_proposal_hash = txObj.payload.data.actions[0].payload.action.proposal_response_payload.proposal_hash.data.toString(
          "hex",
        );
        endorser_id_bytes = txObj.payload.data.actions[0].payload.action.endorsements[0].endorser.id_bytes.data.toString(
          "hex",
        );

        end_mspid =
          tempBlockParse.decodedBlock.data.data[txIndex].payload.data.actions[0]
            .payload.action.endorsements[0].endorser.mspid;
        tx_response =
          tempBlockParse.decodedBlock.data.data[txIndex].payload.data.actions[0]
            .payload.action.proposal_response_payload.extension;
      }

      if (txObj.payload.header.channel_header.typeString === "CONFIG") {
        txid = sha256(txStr);
        readSet =
          txObj.payload.data.last_update.payload?.data.config_update.read_set;
        writeSet =
          txObj.payload.data.last_update.payload?.data.config_update.write_set;
      } else {
        txid =
          tempBlockParse.decodedBlock.data.data[txIndex].payload.header
            .channel_header.tx_id;
      }

      const read_set = JSON.stringify(readSet, null, 2);
      const write_set = JSON.stringify(writeSet, null, 2);

      const chaincode_id = chaincodeID;

      let chaincodename: string = "";
      let checker = "";
      const BlockNumberIn: string = blockNumber;
      try {
        checker =
          tempBlockParse.decodedBlock.data.data[txIndex].payload.data.actions[0]
            .payload.action.proposal_response_payload;
      } catch (error) {}

      if (checker !== "") {
        chaincodename =
          tempBlockParse.decodedBlock.data.data[txIndex].payload.data.actions[0]
            .payload.action.proposal_response_payload.extension.chaincode_id
            .name;
      } else {
        chaincodename = " ";
      }

      await this.dbClient.insertDetailedTransactionEntry({
        block_number: BlockNumberIn,
        block_id: hash,
        fabric_transaction_id: txid,
        createdat:
          tempBlockParse.decodedBlock.data.data[txIndex].payload.header
            .channel_header.timestamp,
        chaincodename: chaincodename,
        status: status,
        creator_msp_id:
          tempBlockParse.decodedBlock.data.data[txIndex].payload.header
            .signature_header.creator.mspid,
        endorser_msp_id: end_mspid,
        chaincode_id: chaincode_id, //tempBlockParse.decodedBlock.data.data[0].payload.data.payload.chaincode_proposal_payload.input.chaincode_spec.chaincode_id,
        type:
          tempBlockParse.decodedBlock.data.data[txIndex].payload.header
            .channel_header.typeString,
        read_set: read_set, //tempBlockParse.decodedBlock.data.data[0].payload.data.actions[0].payload.action.proposal_response_payload,
        write_set: write_set, //tempBlockParse.decodedBlock.data.data[0].payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.input,
        channel_id:
          tempBlockParse.decodedBlock.data.data[txIndex].payload.header
            .channel_header.channel_id,
        payload_extension: payload_extension, //tempBlockParse.decodedBlock.data.data[0].payload.data.actions[0].payload.action.proposal_response_payload.extension,
        creator_id_bytes: creator_id_bytes, //tempBlockParse.decodedBlock.data.data[0].payload.header.signature_header.creator.id_bytes.data,
        creator_nonce: creator_nonce, //tempBlockParse.decodedBlock.data.data[0].payload.header.signature_header.nonce,
        chaincode_proposal_input: chaincode_proposal_input, //tempBlockParse.decodedBlock.data.data[0].payload.data.actions.payload.chaincode_proposal_payload.input.chaincode_spec.input,
        tx_response: tx_response,
        payload_proposal_hash: payload_proposal_hash, //tempBlockParse.decodedBlock.data.data[0].payload.data.actions[0].payload.action.proposal_response_payload.proposal.hash.data,
        endorser_id_bytes: endorser_id_bytes, //tempBlockParse.decodedBlock.data.data[0].payload.data.actions[0].payload.action.endorsements.endorser.id_bytes.data,
        endorser_signature: endorser_signature, //tempBlockParse.decodedBlock.data.data[0].payload.data.actions[0].payload.action.endorsements.signature.data,
      });

      await this.dbClient.insertBlockTransactionEntry({
        fabric_transaction_id: txid,
        fabric_block_id: hash,
        fabric_transaction_data:
          tempBlockParse.decodedBlock.data.data[txIndex].payload.data.actions,
      });
    }

    await this.dbClient.insertBlockDataEntry(block_data);

    if (Number(blockNumber) > this.lastSeenBlock) {
      //update last seen and migrated to database block
      this.lastSeenBlock = Number(blockNumber);
    }

    await this.dbClient.insertBlockDetails({
      fabric_block_id: hash,
      fabric_blocknum: blockNumber,
      fabric_datahash: hash,
      fabric_txcount: txLen,
      fabric_createdat:
        tempBlockParse.decodedBlock.data.data[0].payload.header.channel_header
          .timestamp,
      fabric_prev_blockhash: tempBlockParse.decodedBlock.header.previous_hash,
      fabric_channel_id:
        tempBlockParse.decodedBlock.data.data[0].payload.header.channel_header
          .channel_id,
    });

    if (Number(blockNumber) > this.lastSeenBlock) {
      //update last seen and migrated to database block
      this.lastSeenBlock = Number(blockNumber);
    }

    //this.log.warn("data migrated");

    return true;
  }

  public setLastBlockConsidered(limitLastBlockConsidered: number): number {
    this.lastBlock = limitLastBlockConsidered;
    return this.lastBlock;
  }

  /////////////////// explore end
  public showHowManyBlocksMissing(): number {
    return this.howManyBlocksMissing;
  }

  public async whichBlocksAreMissingInDd(): Promise<void> {
    this.howManyBlocksMissing = 0;
    for (let i: number = 0; i > this.lastBlock - 1; i--) {
      const isThisBlockPresent = await this.dbClient.isThisBlockInDB(i);
      this.log.warn("Answer for query about block in DB ", isThisBlockPresent);
      this.log.warn(
        "Answer for query about block in DB stringify",
        JSON.stringify(isThisBlockPresent),
      );
      if (isThisBlockPresent[0]) {
        this.missedBlocks.push(i.toString());
        this.howManyBlocksMissing += 1;
      }
    }

    this.log.info("missedBlocks", JSON.stringify(this.missedBlocks));
  }
  public async whichBlocksAreMissingInDdSimple(): Promise<void> {
    this.howManyBlocksMissing = 0;
    this.log.warn(
      "Last block for start search missing blocks: ",
      this.lastBlock,
    );
    for (let iterator: number = this.lastBlock; iterator >= 0; iterator--) {
      this.log.warn("search in database block nr: ", iterator);
      const isThisBlockPresent = await this.dbClient.isThisBlockInDB(iterator);
      this.log.warn("Answer from database is: ", isThisBlockPresent);
      this.log.warn("missedBlocks", JSON.stringify(this.missedBlocks));
      this.log.warn("missedBlocks raw", this.missedBlocks);
      this.log.warn(
        "missedBlocks raw",
        this.missedBlocks[this.howManyBlocksMissing],
      );
      this.log.warn("Answer for query about block in DB ", isThisBlockPresent);
      this.log.warn(
        "Answer for query about block in DB stringify",
        JSON.stringify(isThisBlockPresent),
      );
      if (isThisBlockPresent.rowCount === 0) {
        this.log.warn("missing block nr", iterator);
        this.missedBlocks.push(iterator.toString());
        this.howManyBlocksMissing += 1;
      }
    }

    this.log.info("missedBlocks", JSON.stringify(this.missedBlocks));
  }
  // synchronization of missing Blocks
  async synchronizeOnlyMissedBlocks(): Promise<number> {
    if (this.howManyBlocksMissing > 0) {
      let missedIndex = 0;
      let blockNumber: string = this.missedBlocks[missedIndex];
      let moreBlocks = true;
      this.log.info("database start Synchronization");
      do {
        blockNumber = this.missedBlocks[missedIndex];
        const block = await this.apiClient.getBlockV1({
          channelName: this.ledgerChannelName,
          gatewayOptions: this.gatewayOptions,
          query: {
            blockNumber,
          },
        });

        this.log.warn(
          "getBlockV1 nr: ",
          blockNumber,
          " response: ",
          JSON.stringify(block.data),
        );
        let tempBlockParse = JSON.parse(JSON.stringify(block.data));
        if (block.status == 200) {
          // Put scrapped block into database

          const migrateBlock = await this.migrateBlockNrWithTransactions(
            blockNumber,
          );
          // insertBlockTransactionEntry
          if (migrateBlock) {
            const delSynchronized = this.missedBlocks.indexOf(blockNumber);
            delete this.missedBlocks[delSynchronized];
          }
          missedIndex = missedIndex + 1;
          this.howManyBlocksMissing = this.howManyBlocksMissing - 1;
        }

        // TODO add check missedBlocks.length against howManyBlocksMissing
        if (this.howManyBlocksMissing <= 0) {
          moreBlocks = false;
        }
      } while (moreBlocks);
    }
    this.log.info("database Is in Synchronization");
    return this.howManyBlocksMissing;
  }

  async migrateNextBlock(): Promise<void> {
    await this.lastBlockInLedger();
    try {
      const block = await this.migrateBlockNrWithTransactions(
        (this.lastBlock + 1).toString(),
      );
      this.lastSeenBlock = this.lastBlock + 1;
    } catch (error: unknown) {
      const message = `Parsing block #${this.lastBlock + 1} failed: ${error}`;
      this.log.error(message);
      throw new RuntimeError(message, this.getRuntimeErrorCause(error));
    }
  }

  public async insertBlockDataEntry(
    data: Record<string, unknown>,
  ): Promise<any> {
    console.log(data);
    const test = this.dbClient.insertBlockDataEntry(data);
    this.log.warn(test);
    return test;
  }
}
