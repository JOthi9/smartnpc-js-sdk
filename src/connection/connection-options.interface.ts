export interface SmartNPCKeyConnectionBaseOptions {
  host?: string;
}

export interface SmartNPCKeyConnectionOptions
  extends SmartNPCKeyConnectionBaseOptions {
  keyId?: string;
  publicKey?: string;
}

export interface SmartNPCTokenConnectionOptions
  extends SmartNPCKeyConnectionBaseOptions {
  token: string;
  project: string;
}

export type SmartNPCConnectionOptions =
  | SmartNPCKeyConnectionOptions
  | SmartNPCTokenConnectionOptions;
