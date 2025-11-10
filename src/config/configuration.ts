export default () => ({
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT!, 10) || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "password",
    name: process.env.DB_NAME || "university_management",
    sync: process.env.DB_SYNC === "true",
    logging: process.env.DB_LOGGING === "true",
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "fallback_access_secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  email: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT!, 10) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || "noreply@university.com",
    secure: process.env.EMAIL_SECURE === "true",
  },

  app: {
    port: parseInt(process.env.PORT!, 10) || 3333,
    nodeEnv: process.env.NODE_ENV || "development",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    apiPrefix: process.env.API_PREFIX || "api",
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },

  otp: {
    expiresIn: parseInt(process.env.OTP_EXPIRES_IN!, 10) || 10,
    length: parseInt(process.env.OTP_LENGTH!, 10) || 6,
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS!, 10) || 12,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS!, 10) || 5,
    loginLockoutTime: parseInt(process.env.LOGIN_LOCKOUT_TIME!, 10) || 15,
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
    directory: process.env.LOG_DIR || "logs",
  },

  cookies: {
    domain: process.env.COOKIE_DOMAIN,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  },
});
