import { z } from 'zod';
import { SendinblueEmailService } from './providers/sendinblue/sendinblue-email.service';
import type { EmailService } from './types';

const { SENDINBLUE_API_KEY } = z
  .object({
    SENDINBLUE_API_KEY: z.string(),
  })
  .parse(process.env);

export const emailService: EmailService = new SendinblueEmailService(
  SENDINBLUE_API_KEY,
  { magicLink: 1 }
);
