import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { Admin } from "../../admin/models/admin.model";

@Injectable()
export class SuperAdminSeeder {
  private readonly logger = new Logger(SuperAdminSeeder.name);

  constructor(private configService: ConfigService) {}

  async seed(): Promise<void> {
    try {
      const superAdminEmail =
        this.configService.get("DEFAULT_ADMIN_EMAIL") ||
        "superadmin@university.uz";
      const superAdminPassword =
        this.configService.get("DEFAULT_ADMIN_PASSWORD") || "Admin123!";
      const superAdminPhone =
        this.configService.get("DEFAULT_ADMIN_PHONE") || "+998901234567";

      if (!superAdminEmail || !superAdminPassword) {
        throw new Error("Super admin email and password are required");
      }

      let superAdmin = await Admin.findOne({
        where: { admin_type: "super_admin" },
      });

      if (!superAdmin) {
        await this.createSuperAdmin(
          superAdminEmail,
          superAdminPassword,
          superAdminPhone
        );
      } else {
        await this.updateSuperAdmin(
          superAdmin,
          superAdminEmail,
          superAdminPassword,
          superAdminPhone
        );
      }

      this.logger.log("Super Admin setup completed successfully");
    } catch (error) {
      this.logger.error("Failed to setup super admin", error.stack);
      throw error;
    }
  }

  private async createSuperAdmin(
    email: string,
    password: string,
    phone: string
  ): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 12);

    await Admin.create({
      full_name: "Super Admin",
      email: email,
      phone: phone,
      password: hashedPassword,
      admin_type: "super_admin",
      is_approved: true,
      is_active: true,
      is_email_verified: true,
      permissions: ["all"],
    });

    this.logger.log("Super Admin created successfully");
  }

  private async updateSuperAdmin(
    superAdmin: Admin,
    email: string,
    password: string,
    phone: string
  ): Promise<void> {
    const updates: Partial<Admin> = {};

    if (superAdmin.email !== email) {
      const existingAdminWithEmail = await Admin.findOne({
        where: { email: email },
      });

      if (!existingAdminWithEmail) {
        updates.email = email;
      } else {
        this.logger.warn("Email already in use, skipping email update");
      }
    }

    if (superAdmin.phone !== phone) {
      updates.phone = phone;
    }

    if (!superAdmin.password) {
      updates.password = await bcrypt.hash(password, 12);
    } else {
      const isPasswordValid = await bcrypt.compare(
        password,
        superAdmin.password
      );
      if (!isPasswordValid) {
        updates.password = await bcrypt.hash(password, 12);
      }
    }

    if (Object.keys(updates).length > 0) {
      await superAdmin.update(updates);
      this.logger.log("Super Admin updated successfully");
    } else {
      this.logger.log("Super Admin is up to date");
    }
  }
}
