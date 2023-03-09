import { IPluginFactoryOptions } from "@hyperledger/cactus-core-api";
import * as OpenApiJson from "../json/openapi.json";
export { OpenApiJson };
import { PluginFactoryPersistanceFabricBlocks } from "./plugin-factory-fabric-persistence-block";
export { PluginFactoryPersistanceFabricBlocks } from "./plugin-factory-fabric-persistence-block";

export {
  PluginPersistenceFabricBlock,
  IPluginPersistenceFabricBlockOptions,
} from "./plugin-fabric-persistence-block";

export async function createPluginFactory(
  pluginFactoryOptions: IPluginFactoryOptions,
): Promise<PluginFactoryPersistanceFabricBlocks> {
  return new PluginFactoryPersistanceFabricBlocks(pluginFactoryOptions);
}

// export { GetConsortiumEndpointV1, IGetConsortiumJwsEndpointOptions } from "./";

// export { GetNodeJwsEndpoint, IGetNodeJwsEndpointOptions } from "./";
