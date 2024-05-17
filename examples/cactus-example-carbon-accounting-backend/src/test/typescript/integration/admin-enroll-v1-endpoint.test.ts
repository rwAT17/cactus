import { AddressInfo } from "net";

import test, { Test } from "tape-promise/tape";
import expressJwt from "express-jwt";
import { v4 as uuidv4 } from "uuid";
import {
  generateKeyPair,
  exportSPKI,
  GeneralSign,
  generalVerify,
  SignJWT,
} from "jose";
import { StatusCodes } from "http-status-codes";
import jsonStableStringify from "json-stable-stringify";
import { AxiosError } from "axios";
import {
  AuthorizationProtocol,
  ConfigService,
  Configuration,
  IAuthorizationConfig,
} from "@hyperledger/cactus-cmd-api-server";

import {
  IJoseFittingJwtParams,
  LoggerProvider,
  LogLevelDesc,
  Servers,
} from "@hyperledger/cactus-common";

import { pruneDockerAllIfGithubAction } from "@hyperledger/cactus-test-tooling";

import {
  AuthzScope,
  DefaultApi as CarbonAccountingApi,
} from "@hyperledger/cactus-example-carbon-accounting-business-logic-plugin";

import {
  CarbonAccountingApp,
  ICarbonAccountingAppOptions,
} from "../../../main/typescript/carbon-accounting-app";

const testCase = "can enroll new admin users onto the Fabric org";
const logLevel: LogLevelDesc = "TRACE";
const log = LoggerProvider.getOrCreate({
  label: testCase,
  level: logLevel,
});

interface ResponseError<T> extends AxiosError {
  response: {
    data: T;
    status: number;
    statusText: string;
    headers: any
    config: any
    request?: any;
  };
}

test("BEFORE " + testCase, async (t: Test) => {
  const pruning = pruneDockerAllIfGithubAction({ logLevel });
  await t.doesNotReject(pruning, "Pruning didn't throw OK");
  t.end();
});

// FIXME: Restore this once Fabric fixed their typescript definitions:
// https://github.com/hyperledger/fabric-chaincode-node/issues/292
test.skip(testCase, async (t: Test) => {
  const jwtKeyPair = await generateKeyPair("RS256", { modulusLength: 4096 });
  const jwtPublicKey = await exportSPKI(jwtKeyPair.publicKey);
  const expressJwtOptions: expressJwt.Params & IJoseFittingJwtParams = {
    algorithms: ["RS256"],
    secret: jwtPublicKey,
    audience: "carbon-accounting-tool-servers-hostname-here",
    issuer: uuidv4(),
  };
  t.ok(expressJwtOptions, "Express JWT config truthy OK");
  const socketIoJwtOptions = { secret: jwtPublicKey };

  const httpGui = await Servers.startOnPreferredPort(3000);
  t.true(httpGui.listening, `httpGui.listening === true`);
  const httpApi = await Servers.startOnPreferredPort(4000);
  t.true(httpApi.listening, `httpApi.listening === true`);
  const addressInfo = httpApi.address() as AddressInfo;
  t.ok(addressInfo, "httpApi.address() truthy OK");
  t.ok(addressInfo.address, "httpApi.address().address truthy OK");
  t.ok(addressInfo.port, "httpApi.address().port truthy OK");
  const { address, port } = addressInfo;
  const apiBaseUrl = `http://${address}:${port}`;

  const authorizationConfig: IAuthorizationConfig = {
    unprotectedEndpointExemptions: [],
    expressJwtOptions,
    socketIoJwtOptions,
  };

  const configService = new ConfigService();
  const apiSrvOpts = await configService.newExampleConfig();
  apiSrvOpts.authorizationProtocol = AuthorizationProtocol.JSON_WEB_TOKEN;
  apiSrvOpts.authorizationConfigJson = authorizationConfig;
  apiSrvOpts.configFile = "";
  apiSrvOpts.apiCorsDomainCsv = "*";
  apiSrvOpts.apiPort = 0;
  apiSrvOpts.cockpitPort = 0;
  apiSrvOpts.grpcPort = 0;
  apiSrvOpts.apiTlsEnabled = false;
  apiSrvOpts.plugins = [];
  const convictConfig = await configService.newExampleConfigConvict(apiSrvOpts);
  const apiServerOptions = convictConfig.getProperties();

  const appOptions: ICarbonAccountingAppOptions = {
    logLevel: apiSrvOpts.logLevel,
    apiServerOptions,
    httpGui,
    httpApi,
    disableSignalHandlers: true,
  };

  const carbonAccountingApp = new CarbonAccountingApp(appOptions);
  test.onFinish(async () => {
    await carbonAccountingApp.stop();
    await pruneDockerAllIfGithubAction({ logLevel });
  });

  try {
    await carbonAccountingApp.start();
  } catch (ex) {
    log.error(`CarbonAccountingApp crashed. failing test...`, ex);
    throw ex;
  }

  const jwtPayload = {
    name: "Peter",
    scope: [AuthzScope.GroupAdmin],
  };
  const jwtPayloadString = jsonStableStringify(jwtPayload);
  const encoder = new TextEncoder();
  const sign = new GeneralSign(encoder.encode(jwtPayloadString));
  sign.addSignature(jwtKeyPair.privateKey).setProtectedHeader({
    alg: "RS256",
    issuer: expressJwtOptions.issuer,
    audience: expressJwtOptions.audience,
  });
  const tokenWithScope = await sign.sign();
  const jwtSignOptions = {
    algorithms: ["RS256"],
    issuer: expressJwtOptions.issuer,
    audience: expressJwtOptions.audience,
  };
  const verification = await generalVerify(
    tokenWithScope,
    jwtKeyPair.publicKey,
    jwtSignOptions,
  );
  t.ok(verification, "JWT with scope verification truthy OK");

  const configTokenWithScope = new Configuration({
    basePath: apiBaseUrl,
    baseOptions: {
      headers: {
        Authorization: `Bearer ${tokenWithScope}`,
      },
    },
  });

  const apiClient = new CarbonAccountingApi(configTokenWithScope);

  const res = await apiClient.enrollAdminV1({
    orgName: "Org1MSP",
  });
  t.ok(res, "enrollAdminV1 response truthy OK");
  t.true(res.status >= 200, "enrollAdminV1 status >= 200 OK");
  t.true(res.status < 300, "enrollAdminV1 status < 300 200 OK");

  const tokenNoScope = await new SignJWT({ scope: [] })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(jwtSignOptions.issuer)
    .setAudience(jwtSignOptions.audience)
    .sign(jwtKeyPair.privateKey);

  const configTokenWithoutScope = new Configuration({
    basePath: apiBaseUrl,
    baseOptions: {
      headers: {
        Authorization: `Bearer ${tokenNoScope}`,
      },
    },
  });

  const apiClientBad = new CarbonAccountingApi(configTokenWithoutScope);

  try {
    await apiClientBad.enrollAdminV1({ orgName: "does-not-matter" });
    t.fail("enroll admin response status === 403 FAIL");
  } catch (err) {
    const e = err as ResponseError<any>

    t.ok(e, "error thrown for forbidden endpoint truthy OK");
    t.ok(e.response, "enroll admin response truthy OK");
    t.equal(
      e?.response?.status,
      StatusCodes.FORBIDDEN,
      "enroll admin response status === 403 OK",
    );
    t.notok(e?.response?.data?.data, "out.response.data.data falsy OK");
    t.notok(e?.response?.data?.success, "out.response.data.success falsy OK");
  }

  t.end();
});
