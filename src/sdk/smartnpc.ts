import { SmartNPCCharacter } from './character';
import { SmartNPCConnection, SmartNPCConnectionOptions } from './connection';
import { SmartNPCPlayerOptions, SmartNPCPlayer } from './player';

export class SmartNPC {
  private connection?: SmartNPCConnection;

  async init(connectionOptions: SmartNPCConnectionOptions): Promise<SmartNPC> {
    this.connection = await new SmartNPCConnection().init(connectionOptions);

    return this;
  }

  getCharacter(id: string): SmartNPCCharacter {
    if (!this.connection) {
      throw new Error('Must call init first');
    }

    return new SmartNPCCharacter(this.connection!, id);
  }

  getPlayer(options: string | SmartNPCPlayerOptions): SmartNPCPlayer {
    return new SmartNPCPlayer(options);
  }
}
