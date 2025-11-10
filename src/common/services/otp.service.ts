import { Injectable } from "@nestjs/common";
import * as otpGenerator from "otp-generator";

@Injectable()
export class OtpService {
  generateOTP(length: number = 6): string {
    if (length < 4 || length > 8) {
      throw new Error("OTP length must be between 4 and 8 characters");
    }

    const otp = otpGenerator.generate(length, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    return otp;
  }

  isOTPExpired(createdAt: Date, expiresInMinutes: number = 10): boolean {
    if (
      !createdAt ||
      !(createdAt instanceof Date) ||
      isNaN(createdAt.getTime())
    ) {
      return true;
    }

    const now = new Date();
    const expirationTime = new Date(
      createdAt.getTime() + expiresInMinutes * 60 * 1000
    );

    return now > expirationTime;
  }

  validateOTP(
    inputOTP: string,
    storedOTP: string,
    createdAt: Date,
    expiresInMinutes: number = 10
  ): boolean {
    if (!inputOTP || !storedOTP || !createdAt) {
      return false;
    }

    if (this.isOTPExpired(createdAt, expiresInMinutes)) {
      return false;
    }

    return inputOTP === storedOTP;
  }
}
