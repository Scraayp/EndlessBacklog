import nodemailer from "nodemailer";
import { env } from "./env.js";

/**
 * SMTP transport for Purelymail (smtp.purelymail.com:465, implicit TLS).
 * SMTP_SECURE=true => TLS from the start of the connection (port 465).
 * Set SMTP_SECURE=false with SMTP_PORT=587 to use STARTTLS instead.
 */
export const mailer = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail(options: SendMailOptions): Promise<void> {
  await mailer.sendMail({
    from: env.MAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}
