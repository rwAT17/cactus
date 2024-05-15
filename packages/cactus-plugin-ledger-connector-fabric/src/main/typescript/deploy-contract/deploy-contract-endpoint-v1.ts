import { Express, Request, Response } from "express";
import HttpStatus from "http-status-codes";

import {
  Logger,
  Checks,
  LogLevelDesc,
  LoggerProvider,
  IAsyncProvider,
  safeStringifyException,
} from "@hyperledger/cactus-common";

import {
  IWebServiceEndpoint,
  IExpressRequestHandler,
  IEndpointAuthzOptions,
} from "@hyperledger/cactus-core-api";

import { handleRestEndpointException, registerWebServiceEndpoint } from "@hyperledger/cactus-core";

import { PluginLedgerConnectorFabric } from "../plugin-ledger-connector-fabric";
import { DeployContractV1Request } from "../generated/openapi/typescript-axios/index";
import OAS from "../../json/openapi.json";

export interface IDeployContractEndpointV1Options {
  logLevel?: LogLevelDesc;
  connector: PluginLedgerConnectorFabric;
}

export class DeployContractEndpointV1 implements IWebServiceEndpoint {
  public static readonly CLASS_NAME = "DeployContractEndpointV1";

  private readonly log: Logger;

  public get className(): string {
    return DeployContractEndpointV1.CLASS_NAME;
  }

  constructor(public readonly opts: IDeployContractEndpointV1Options) {
    const fnTag = `${this.className}#constructor()`;
    Checks.truthy(opts, `${fnTag} arg options`);
    Checks.truthy(opts.connector, `${fnTag} arg options.connector`);

    const level = this.opts.logLevel || "INFO";
    const label = this.className;
    this.log = LoggerProvider.getOrCreate({ level, label });
  }

  public getExpressRequestHandler(): IExpressRequestHandler {
    return this.handleRequest.bind(this);
  }

  public get oasPath(): (typeof OAS.paths)["/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-fabric/deploy-contract-go-source"] {
    return OAS.paths[
      "/api/v1/plugins/@hyperledger/cactus-plugin-ledger-connector-fabric/deploy-contract"
    ];
  }

  public getPath(): string {
    return this.oasPath.post["x-hyperledger-cacti"].http.path;
  }

  public getVerbLowerCase(): string {
    return this.oasPath.post["x-hyperledger-cacti"].http.verbLowerCase;
  }

  public getOperationId(): string {
    return this.oasPath.post.operationId;
  }

  public async registerExpress(
    expressApp: Express,
  ): Promise<IWebServiceEndpoint> {
    await registerWebServiceEndpoint(expressApp, this);
    return this;
  }

  getAuthorizationOptionsProvider(): IAsyncProvider<IEndpointAuthzOptions> {
    // TODO: make this an injectable dependency in the constructor
    return {
      get: async () => ({
        isProtected: true,
        requiredRoles: [],
      }),
    };
  }

  async handleRequest(req: Request, res: Response): Promise<void> {
    const fnTag = `${this.className}#handleRequest()`;
    const verbUpper = this.getVerbLowerCase().toUpperCase();
    this.log.debug(`${verbUpper} ${this.getPath()}`);

    try {
      const { connector } = this.opts;
      const reqBody = req.body as DeployContractV1Request;
      const resBody = await connector.deployContract(reqBody);
      res.status(HttpStatus.OK);
      res.json(resBody);
    } catch (ex) {
      this.log.error(`${fnTag} failed to serve contract deploy request`, ex);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        error: safeStringifyException(ex),
      });
    }
  }
}


// {
//   this.log.error(`${fnTag} failed to serve contract deploy request`, ex);
//   if (typeof ex === 'object' && ex !== null) {
//     if ('message' in ex && typeof ex.message === 'string') {=
//       const errorMsg = ex.message
//       handleRestEndpointException({ errorMsg, log: this.log, error: ex, res })
//     }
//   }
// }