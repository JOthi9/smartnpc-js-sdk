import { SmartNPCPlayerOptions } from './player-options.interface';

export class SmartNPCPlayer {
  readonly idInClient: string;
  readonly name?: string;

  constructor(options: string | SmartNPCPlayerOptions) {
    if (typeof options === 'string') {
      this.idInClient = options;
    } else {
      this.idInClient = options.id;
      this.name = options.name;
    }
  }
}
