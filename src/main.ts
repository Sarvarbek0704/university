import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import cookieParser from "cookie-parser";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { CustomLogger } from "./common/services/logger.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
  });

  const configService = app.get(ConfigService);
  const logger = app.get(CustomLogger);

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  const corsOrigins = [
    configService.get("FRONTEND_URL") || "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ].filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
    ],
  });

  app.setGlobalPrefix("api");
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle("University Management System API")
    .setDescription("Comprehensive university management system API")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth"
    )
    .addTag("auth", "Authentication endpoints")
    .addTag("admin", "Admin operations")
    .addTag("students", "Students management")
    .addTag("teachers", "Teachers management")
    .addTag("faculties", "Faculties management")
    .addTag("departments", "Departments management")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
  });

  const port = configService.get<number>("PORT") || 3333;

  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  logger.log(`🌍 CORS enabled for: ${corsOrigins.join(", ")}`);
  logger.log(
    `🎯 Environment: ${configService.get("NODE_ENV") || "development"}`
  );
}

bootstrap().catch((error) => {
  console.error("❌ Application failed to start:", error);
  process.exit(1);
});
