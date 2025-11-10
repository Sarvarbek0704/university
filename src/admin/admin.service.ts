import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Admin } from "./models/admin.model";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { FilterAdminDto } from "./dto/filter-admin.dto";
import { Department } from "../departments/models/department.model";
import { Op, Sequelize } from "sequelize";
import * as bcrypt from "bcrypt";

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin)
    private readonly adminModel: typeof Admin
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    try {
      if (!createAdminDto?.email || !createAdminDto?.phone) {
        throw new BadRequestException("Email and phone are required");
      }

      const existingAdmin = await this.adminModel.findOne({
        where: {
          [Op.or]: [
            { email: createAdminDto.email },
            { phone: createAdminDto.phone },
          ],
        },
      });

      if (existingAdmin) {
        throw new ConflictException(
          "Admin with this email or phone already exists"
        );
      }

      const hashedPassword = await bcrypt.hash(createAdminDto.password, 12);

      const admin = await this.adminModel.create({
        ...createAdminDto,
        password: hashedPassword,
      });

      return await this.findOne(admin.id);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const errorMessages = error.errors?.map((e) => e.message).join(", ");
        throw new BadRequestException(errorMessages || "Validation failed");
      }

      throw new InternalServerErrorException("Failed to create admin");
    }
  }

  async findAll(filterDto: FilterAdminDto): Promise<Admin[]> {
    try {
      const whereClause: any = {};

      if (filterDto.admin_type) {
        whereClause.admin_type = filterDto.admin_type;
      }

      if (filterDto.department_id) {
        whereClause.department_id = filterDto.department_id;
      }

      if (filterDto.is_active !== undefined) {
        whereClause.is_active = filterDto.is_active;
      }

      if (filterDto.search) {
        whereClause.full_name = {
          [Op.iLike]: `%${filterDto.search}%`,
        };
      }

      return await this.adminModel.findAll({
        where: whereClause,
        include: [
          {
            model: Department,
            attributes: ["id", "name"],
          },
        ],
        attributes: { exclude: ["password", "refreshToken", "accessToken"] },
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      throw new InternalServerErrorException("Failed to fetch admins");
    }
  }

  async findOne(id: number): Promise<Admin> {
    try {
      if (!id || isNaN(id)) {
        throw new BadRequestException("Invalid admin ID");
      }

      const admin = await this.adminModel.findByPk(id, {
        include: [
          {
            model: Department,
          },
        ],
        attributes: { exclude: ["password", "refreshToken", "accessToken"] },
      });

      if (!admin) {
        throw new NotFoundException(`Admin with ID ${id} not found`);
      }

      return admin;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to fetch admin");
    }
  }

  async findOneByEmail(email: string): Promise<Admin> {
    try {
      if (!email || typeof email !== "string") {
        throw new BadRequestException("Valid email is required");
      }

      const admin = await this.adminModel.findOne({
        where: { email },
      });

      if (!admin) {
        throw new NotFoundException(`Admin with email ${email} not found`);
      }

      return admin;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to fetch admin by email");
    }
  }

  async update(id: number, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    try {
      if (!id || isNaN(id)) {
        throw new BadRequestException("Invalid admin ID");
      }

      const admin = await this.findOne(id);

      if (updateAdminDto.email || updateAdminDto.phone) {
        const whereCondition: any = {
          id: { [Op.ne]: id },
        };

        if (updateAdminDto.email && updateAdminDto.phone) {
          whereCondition[Op.or] = [
            { email: updateAdminDto.email },
            { phone: updateAdminDto.phone },
          ];
        } else if (updateAdminDto.email) {
          whereCondition.email = updateAdminDto.email;
        } else if (updateAdminDto.phone) {
          whereCondition.phone = updateAdminDto.phone;
        }

        const existingAdmin = await this.adminModel.findOne({
          where: whereCondition,
        });

        if (existingAdmin) {
          throw new ConflictException(
            "Admin with this email or phone already exists"
          );
        }
      }

      const updateData: any = {};

      const allowedFields = [
        "full_name",
        "email",
        "phone",
        "admin_type",
        "department_id",
        "position",
        "permissions",
        "is_approved",
        "is_active",
      ];

      allowedFields.forEach((field) => {
        if (updateAdminDto[field] !== undefined) {
          updateData[field] = updateAdminDto[field];
        }
      });

      if (updateAdminDto.password) {
        updateData.password = await bcrypt.hash(updateAdminDto.password, 12);
      }

      await admin.update(updateData);

      return await this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to update admin");
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      if (!id || isNaN(id)) {
        throw new BadRequestException("Invalid admin ID");
      }

      const admin = await this.findOne(id);
      await admin.destroy();

      return { message: "Admin deleted successfully" };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to delete admin");
    }
  }

  async toggleStatus(id: number): Promise<Admin> {
    try {
      if (!id || isNaN(id)) {
        throw new BadRequestException("Invalid admin ID");
      }

      const admin = await this.findOne(id);
      await admin.update({ is_active: !admin.is_active });

      return await this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to toggle admin status");
    }
  }

  async updateTokens(
    id: number,
    tokens: { accessToken?: string | null; refreshToken?: string | null }
  ): Promise<void> {
    try {
      if (!id || isNaN(id)) {
        throw new BadRequestException("Invalid admin ID");
      }

      const updateData: any = {};

      if (tokens.accessToken !== undefined) {
        updateData.accessToken = tokens.accessToken;
      }

      if (tokens.refreshToken !== undefined) {
        updateData.refreshToken = tokens.refreshToken;
      }

      const [affectedRows] = await this.adminModel.update(updateData, {
        where: { id },
      });

      if (affectedRows === 0) {
        throw new NotFoundException(`Admin with ID ${id} not found`);
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to update tokens");
    }
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      if (!plainPassword || !hashedPassword) {
        return false;
      }
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      return false;
    }
  }
}
