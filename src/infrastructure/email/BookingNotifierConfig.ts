import type { MessageSenderConfig } from './MessageSenderConfig';

export interface BookingNotifierConfig extends MessageSenderConfig {
  timeZone: string;
}
