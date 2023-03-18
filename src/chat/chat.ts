import * as EventEmitter from 'eventemitter3';

import { SmartNPCConnection } from '../connection';
import { SmartNPCEvent } from '../event.enum';
import { SmartNPCChatOptions } from './chat-options.interface';
import { SmartNPCMessage } from './message.interface';

export class SmartNPCChat extends (EventEmitter as any) {
  private connection: SmartNPCConnection;
  private options: SmartNPCChatOptions;

  constructor(connection: SmartNPCConnection, options: SmartNPCChatOptions) {
    super();

    this.connection = connection;
    this.options = options;
  }

  async getMessageHistory(): Promise<SmartNPCMessage[]> {
    const { character, player } = this.options;

    try {
      const response = await this.connection.fetch(
        `project/${this.connection.getProject()}/character/${character}/chat/history?` +
          new URLSearchParams({
            playerIdInClient: player.idInClient,
          }),
      );

      return response?.data;
    } catch (e) {
      console.error('SmartNPCChat/getInfo()', e);

      throw new Error(`Couldn't get message history`);
    }
  }

  sendMessage(message: string): Promise<void> {
    const { character, player } = this.options;

    this.emit(SmartNPCEvent.MessageStarted, {
      message,
      response: '',
    });

    this.emit(SmartNPCEvent.MessageProgress, {
      message,
      response: '',
    });

    return this.connection.stream(
      `project/${this.connection.getProject()}/character/${character}/chat/message`,
      {
        method: 'post',
        body: JSON.stringify({
          message,
          playerIdInClient: player.idInClient,
          playerName: player.name,
        }),
      },
      {
        onProgress: (result, chunk) => {
          this.emit(SmartNPCEvent.MessageProgress, {
            message,
            response: result,
            chunk,
          });
        },
        onCompleted: (result) => {
          this.emit(SmartNPCEvent.MessageCompleted, {
            message,
            response: result,
          });
        },
        onError: (error) => {
          this.emit(
            SmartNPCEvent.MessageError,
            {
              message,
              error: error.message,
            },
            error,
          );
        },
      },
    );
  }
}
