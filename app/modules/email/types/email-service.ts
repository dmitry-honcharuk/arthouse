import type { SendOptions } from './send-options';

export interface EmailService {
  sendMagicLink(link: string, sendOptions: SendOptions): Promise<void>;
}
