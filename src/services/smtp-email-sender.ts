import { SmtpEmailSenderConfig } from '../types/smtp-email-sender';
import { createTransport } from 'nodemailer';
import * as SMTPTransport from 'nodemailer/lib/smtp-transport';
import * as Mail from 'nodemailer/lib/mailer';
export class SmtpEmailSender {
    private transporter: Mail;

    constructor(config: SmtpEmailSenderConfig) {
        this.transporter = createTransport({
            host: config.host,
            port: config.port,
            auth: {
                user: config.userName,
                pass: config.password,
            },
            secure: false,
        } as SMTPTransport.Options);
    }
    async send(payload: { sender: string; reciever: string; subject: string; body: string }) {
        return this.transporter.sendMail({
            from: payload.sender,
            to: payload.reciever,
            subject: payload.subject,
            html: payload.body,
        });
    }
}
