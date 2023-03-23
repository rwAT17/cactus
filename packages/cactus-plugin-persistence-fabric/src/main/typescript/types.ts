export interface BlockDataResponse {
  decodedBlock: {
    header: Record<string, unknown>;
    data: { data: Record<string, unknown>[] };
    metadata: Record<string, unknown>;
  };
}

export interface getStatusReturn {
  instanceId: string;
  connected: boolean;
  webServicesRegistered: boolean;
  lastSeenBlock: number;
}

// db types
export interface InsertBlockDataInterface {
  fabric_block_id: string;
  fabric_block_num: number;
  fabric_block_data: string;
}
