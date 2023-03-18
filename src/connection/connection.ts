import jwt_decode from 'jwt-decode';

import {
  SmartNPCConnectionOptions,
  SmartNPCKeyConnectionOptions,
  SmartNPCTokenConnectionOptions,
} from './connection-options.interface';
import { Token } from './token';

const DEFAULT_HOST = 'https://api.smartnpc.ai/v1';

export class SmartNPCConnection {
  private options?: SmartNPCConnectionOptions;
  private token?: string;
  private project?: string;

  async init(options: SmartNPCConnectionOptions): Promise<SmartNPCConnection> {
    this.options = options;

    if (!this.options) {
      throw new Error('Authentication Failed: Must pass options');
    }

    if (!this.options.host) this.options.host = DEFAULT_HOST;

    await this.auth();

    return this;
  }

  private async auth(): Promise<void> {
    let initialized = false;

    if (this.options?.hasOwnProperty('token')) {
      const tokenOptions: SmartNPCTokenConnectionOptions = this
        .options as SmartNPCTokenConnectionOptions;

      if (tokenOptions.token && tokenOptions.project) {
        this.token = tokenOptions.token;
        this.project = tokenOptions.project;

        initialized = true;
      } else {
        throw new Error(
          `Authentication Failed: Must pass both token and project`,
        );
      }
    } else {
      const keyOptions: SmartNPCKeyConnectionOptions = this
        .options as SmartNPCKeyConnectionOptions;

      if (keyOptions.keyId && keyOptions.publicKey) {
        try {
          const response = await this.fetch('key/auth', {
            method: 'post',
            body: JSON.stringify({
              keyId: keyOptions.keyId,
              publicKey: keyOptions.publicKey,
            }),
          });

          this.token = response.token;
          this.project = jwt_decode<Token>(response.token).project;

          initialized = true;
        } catch (e) {
          console.error('SmartNPCConnection/auth()', e);

          throw new Error(`Authentication Failed: Server Error`);
        }
      }
    }

    if (!initialized) {
      throw new Error('Must specify either key or token options');
    }
  }

  private async innerFetch(url: string, init?: RequestInit): Promise<any> {
    const headers: HeadersInit = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = 'Bearer ' + this.token;
    }

    return await fetch(`${this.options!.host}/${url}`, {
      headers,
      ...init,
    });
  }

  async fetch(url: string, init?: RequestInit): Promise<any> {
    const response = await this.innerFetch(url, init);

    return await response.json();
  }

  async stream(
    url: string,
    init?: RequestInit,
    callbacks?: {
      onProgress?: (result: string, chunk: string) => void;
      onCompleted?: (result: string) => void;
      onError?: (error: any) => void;
    },
  ): Promise<void> {
    function emitError(e: any) {
      if (callbacks?.onError) callbacks?.onError(e);
      else console.error(e);
    }

    try {
      const response = await this.innerFetch(url, init);

      this.iterateReader({
        reader: response.body.getReader(),
        onProgress: callbacks?.onProgress,
        onComplete: callbacks?.onCompleted,
        onError: emitError,
      });
    } catch (e) {
      emitError(e);
    }
  }

  private async iterateReader({
    reader,
    onProgress,
    onError,
    onComplete,
  }: {
    reader: ReadableStreamDefaultReader<Uint8Array>;
    onProgress?: (result: string, chunk: string) => void;
    onComplete?: (result: string) => void;
    onError?: (e: any) => void;
  }) {
    let result = '';

    try {
      let hasError = false;

      for await (const chunk of this.readChunks(reader)) {
        hasError = chunk.startsWith(`{"statusCode"`);

        if (hasError) {
          onError?.(JSON.parse(chunk));

          break;
        } else {
          result += chunk;

          onProgress?.(result, chunk);
        }
      }

      if (!hasError) onComplete?.(result);
    } catch (e) {
      onError?.(e);
    }
  }

  // readChunks() reads from the provided reader and yields the results into an async iterable
  private readChunks(reader: ReadableStreamDefaultReader<Uint8Array>) {
    const decoder = new TextDecoder();

    return {
      async *[Symbol.asyncIterator]() {
        let readResult = await reader.read();

        while (!readResult.done) {
          yield decoder.decode(readResult.value);

          readResult = await reader.read();
        }
      },
    };
  }

  getProject(): string | undefined {
    return this.project;
  }
}
