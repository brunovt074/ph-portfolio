import type { EmailAttachment } from './EmailAttachment';

export interface ResendEmailPayload {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  attachments?: EmailAttachment[];
}

export interface ResendEmailClient {
  emails: {
    send(payload: ResendEmailPayload): Promise<{ error: { message: string } | null }>;
  };
}
