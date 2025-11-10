import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get("EMAIL_HOST");
    const port = this.configService.get("EMAIL_PORT");
    const user = this.configService.get("EMAIL_USER");
    const pass = this.configService.get("EMAIL_PASS");

    if (!host || !port || !user || !pass) {
      this.logger.warn(
        "Email configuration is incomplete. Email service may not work properly."
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: false,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    this.verifyTransporter();
  }

  private async verifyTransporter(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log("Email transporter verified successfully");
    } catch (error) {
      this.logger.error("Email transporter verification failed", error);
    }
  }

  async sendVerificationEmail(
    email: string,
    otp: string,
    name: string
  ): Promise<void> {
    if (!email || !otp || !name) {
      throw new InternalServerErrorException(
        "Email, OTP and name are required"
      );
    }

    try {
      const mailOptions = {
        from: this.configService.get("EMAIL_FROM"),
        to: email,
        subject: "University Management - Email Verification",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Hello ${name}!</h2>
            <p>Thank you for registering with University Management System.</p>
            <p>Your verification code is:</p>
            <div style="background: #f4f4f4; padding: 15px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; margin: 0; font-size: 32px;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr>
            <p style="color: #666;">University Management System Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw new InternalServerErrorException(
        "Failed to send verification email"
      );
    }
  }

  async sendApprovalEmail(
    email: string,
    name: string,
    userType: string
  ): Promise<void> {
    if (!email || !name || !userType) {
      this.logger.warn("Missing parameters for approval email");
      return;
    }

    try {
      const mailOptions = {
        from: this.configService.get("EMAIL_FROM"),
        to: email,
        subject: `University Management - ${userType} Account Approved`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Congratulations ${name}!</h2>
            <p>Your ${userType} account has been approved by the administrator.</p>
            <p>You can now login to your account and access the system.</p>
            <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;">✅ Your account is now active and ready to use!</p>
            </div>
            <p><a href="${this.configService.get("FRONTEND_URL")}/login" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to System</a></p>
            <hr>
            <p style="color: #666;">University Management System Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Approval email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send approval email to ${email}`, error);
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    name: string
  ): Promise<void> {
    if (!email || !resetToken || !name) {
      throw new InternalServerErrorException(
        "Email, reset token and name are required"
      );
    }

    try {
      const resetLink = `${this.configService.get("FRONTEND_URL")}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: this.configService.get("EMAIL_FROM"),
        to: email,
        subject: "University Management - Password Reset",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Hello ${name}!</h2>
            <p>You requested to reset your password.</p>
            <p>Click the link below to reset your password:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${resetLink}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr>
            <p style="color: #666;">University Management System Team</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error
      );
      throw new InternalServerErrorException(
        "Failed to send password reset email"
      );
    }
  }
}
