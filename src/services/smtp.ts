import { inject, injectable } from "tsyringe";
import { createTransport, SendMailOptions } from "nodemailer";
import type { AppConfig } from "../config.js";
export type SmtpSendOptions = {
   to: string;
   subject: string;
   text: string;
} & Exclude<SendMailOptions, 'from'>;
export type SendMessageInfo = unknown;
export type Transport = ReturnType<typeof createTransport>;
@injectable()
export default class SmtpService {
   transport?: Transport;
   constructor(@inject("config")
   private config: AppConfig) {
      if (this.config.smtp.enabled) {
         this.transport = createTransport({
            service: "gmail",
            auth: {
               user: this.config.smtp.user,
               pass: this.config.smtp.app_password
            }
         });
      }
   }
   async send(options: SmtpSendOptions): Promise<SendMessageInfo> {
      if (!this.transport) {
         return Promise.reject(new Error("SMTP transport is not configured"));
      }
      return this.transport.sendMail({
         ...options,
         from: this.config.smtp.user
      });
   }
}