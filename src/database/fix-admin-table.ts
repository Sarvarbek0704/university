import { Sequelize } from "sequelize";

async function fixAdminTable() {
  const sequelize = new Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT!, 10) || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "university_management",
    logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    const tableName =
      process.env.NODE_ENV === "test" ? "Admins_test" : "Admins";

    const queries = [
      `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "verification_otp" VARCHAR(10)`,
      `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "otp_expires_at" TIMESTAMP WITH TIME ZONE`,
      `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "is_email_verified" BOOLEAN NOT NULL DEFAULT false`,
      `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "is_approved" BOOLEAN NOT NULL DEFAULT false`,
      `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true`,
      `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "accessToken" TEXT`,
      `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "refreshToken" TEXT`,
      `UPDATE "${tableName}" SET "is_approved" = true, "is_active" = true, "is_email_verified" = true WHERE "admin_type" = 'super_admin'`,
    ];

    for (const query of queries) {
      try {
        await sequelize.query(query);
        console.log(`Executed: ${query.split("ADD COLUMN")[0]}...`);
      } catch (error) {
        console.warn(`Warning for query: ${error.message}`);
      }
    }

    console.log("Admin table migration completed successfully");
  } catch (error) {
    console.error("Error fixing admin table:", error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  fixAdminTable();
}

export { fixAdminTable };
