import { Injectable } from "@nestjs/common";

@Injectable()
export class CookieService {
  getRefreshToken(
    request: any,
    type: "admin" | "teacher" | "student"
  ): string | null {
    if (!request?.cookies) {
      return null;
    }

    const cookieName = this.getCookieName(type);
    return request.cookies[cookieName] || null;
  }

  clearRefreshToken(
    response: any,
    type: "admin" | "teacher" | "student"
  ): void {
    if (!response?.cookie) {
      return;
    }

    const cookieName = this.getCookieName(type);
    response.clearCookie(cookieName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  }

  setRefreshToken(
    response: any,
    type: "admin" | "teacher" | "student",
    token: string
  ): void {
    if (!response?.cookie || !token) {
      return;
    }

    const cookieName = this.getCookieName(type);
    const isProduction = process.env.NODE_ENV === "production";

    response.cookie(cookieName, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
      ...(isProduction && { domain: this.getDomain() }),
    });
  }

  private getCookieName(type: "admin" | "teacher" | "student"): string {
    const cookieNames = {
      admin: "refresh_token",
      teacher: "teacher_refresh_token",
      student: "student_refresh_token",
    };

    return cookieNames[type] || "refresh_token";
  }

  private getDomain(): string | undefined {
    if (process.env.NODE_ENV === "production") {
      return process.env.COOKIE_DOMAIN || ".yourdomain.com";
    }
    return undefined;
  }
}
