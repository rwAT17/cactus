import { Express, Request, Response } from "express";

import {
  Logger,
  Checks,
  LogLevelDesc,
  LoggerProvider,
  IAsyncProvider,
} from "@hyperledger/cactus-common";
import {
  IEndpointAuthzOptions,
  IExpressRequestHandler,
  IWebServiceEndpoint,
} from "@hyperledger/cactus-core-api";
import {
  handleRestEndpointException,
  registerWebServiceEndpoint,
} from "@hyperledger/cactus-core";

import { PluginKeychainAzureKv } from "../plugin-keychain-azure-kv";

import OAS from "../../json/openapi.json";
import { SetKeychainEntryRequestV1 } from "../generated/openapi/typescript-axios";

export interface ISetKeychainEntryEndpointOptions {
  logLevel?: LogLevelDesc;
  connector: PluginKeychainAzureKv;
}

export class SetKeychainEntryEndpoint implements IWebServiceEndpoint {
  public static readonly CLASS_NAME = "SetKeychainEntryEndpoint";

  private readonly log: Logger;

  public get className(): string {
    return SetKeychainEntryEndpoint.CLASS_NAME;
  }

  constructor(public readonly options: ISetKeychainEntryEndpointOptions) {
    const fnTag = `${this.className}#constructor()`;
    Checks.truthy(options, `${fnTag} arg options`);
    Checks.truthy(options.connector, `${fnTag} arg options.connector`);

    const level = this.options.logLevel || "INFO";
    const label = this.className;
    this.log = LoggerProvider.getOrCreate({ level, label });
  }

  public getOasPath() {
    return OAS.paths[
      "/api/v1/plugins/@hyperledger/cactus-plugin-keychain-azure-kv/set-keychain-entry"
    ];
  }

  public getPath(): string {
    const apiPath = this.getOasPath();
    return apiPath.post["x-hyperledger-cacti"].http.path;
  }

  public getVerbLowerCase(): string {
    const apiPath = this.getOasPath();
    return apiPath.post["x-hyperledger-cacti"].http.verbLowerCase;
  }

  public getOperationId(): string {
    return this.getOasPath().post.operationId;
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

  public async registerExpress(
    expressApp: Express,
  ): Promise<IWebServiceEndpoint> {
    await registerWebServiceEndpoint(expressApp, this);
    return this;
  }

  public getExpressRequestHandler(): IExpressRequestHandler {
    return this.handleRequest.bind(this);
  }

  public async handleRequest(req: Request, res: Response): Promise<void> {
    const reqTag = `${this.getVerbLowerCase()} - ${this.getPath()}`;
    this.log.debug(reqTag);
    try {
      const { key, value } = req.body as SetKeychainEntryRequestV1;
      const resBody = await this.options.connector.set(key, value);
      res.json(resBody);
    } catch (ex) {
      this.log.error(`Crash while serving ${reqTag}`, ex);
      const errorMsg = `Internal server Error`;
      handleRestEndpointException({ errorMsg, log: this.log, error: ex, res });
    }
  }
}
