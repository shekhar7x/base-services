export interface SmtpEmailSenderConfig {
    host: string | 'smtp.gmail.com';
    port: number | 587;
    userName: string;
    password: string;
    secure: boolean;
}
