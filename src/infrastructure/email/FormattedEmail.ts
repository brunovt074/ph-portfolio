import type { EmailAttachment } from './EmailAttachment';

export interface FormattedEmail {
  subject: string;
  text: string;
  attachments?: EmailAttachment[];
}
