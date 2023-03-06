export interface SmartNPCKeyConnectionOptions {
  keyId?: string;
  publicKey?: string;
}

export interface SmartNPCTokenConnectionOptions {
  token: string;
  project: string;
}

export type SmartNPCConnectionOptions =
  | SmartNPCKeyConnectionOptions
  | SmartNPCTokenConnectionOptions;
