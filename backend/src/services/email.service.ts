import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'

export interface EmailOptions {
  to: string
  subject: string
  html?: string
  text?: string
  from?: string
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter

  constructor(private configService: ConfigService) {
    if (this.configService.get('SMTP_HOST') === 'smtp.gmail.com') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASS'),
        },
      })
    } else {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
        port: this.configService.get('SMTP_PORT', 587),
        secure: false, // Use STARTTLS instead of SSL
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASS'),
        },
      })
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from:
          options.from ||
          this.configService.get('SMTP_FROM', 'noreply@sterlingstudiosnyc.com'), // this will be from the user that just registered probably
        to: options.to, // this will be sent to PO to let them know someone has registered
        subject: options.subject,
        html: options.html,
        text: options.text,
      }
      await this.transporter.sendMail(mailOptions)
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`)
    }
  }
}
