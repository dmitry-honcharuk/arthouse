import {
  SendSmtpEmail,
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
} from '@sendinblue/client';
import type { EmailService, EmailType, SendOptions } from '../../types';

export class SendinblueEmailService implements EmailService {
  private emailClient = new TransactionalEmailsApi();

  constructor(
    apiKey: string,
    private emailTemplates: Record<EmailType, number>
  ) {
    this.emailClient.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);
  }

  async sendMagicLink(link: string, sendOptions: SendOptions): Promise<void> {
    const email = new SendSmtpEmail();

    email.to = [{ email: sendOptions.to }];
    email.templateId = this.emailTemplates.magicLink;
    email.params = { link };

    await this.emailClient.sendTransacEmail(email);
  }
}
