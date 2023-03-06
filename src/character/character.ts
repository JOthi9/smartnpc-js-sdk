import { SmartNPCChat } from '../chat';
import { SmartNPCConnection } from '../connection';
import { SmartNPCPlayer } from '../player';
import { SmartNPCCharacterResponse } from './character-response.interface';

export class SmartNPCCharacter {
  private connection: SmartNPCConnection;
  private id: string;

  constructor(connection: SmartNPCConnection, id: string) {
    this.connection = connection;
    this.id = id;
  }

  async getInfo(): Promise<SmartNPCCharacterResponse> {
    try {
      return await this.connection.fetch(
        `project/${this.connection.getProject()}/character/${this.id}`,
      );
    } catch (e) {
      console.error('SmartNPCCharacter/getInfo()', e);

      throw new Error(`Couldn't get character info`);
    }
  }

  getChat(player: SmartNPCPlayer): SmartNPCChat {
    return new SmartNPCChat(this.connection!, {
      character: this.id,
      player,
    });
  }
}
