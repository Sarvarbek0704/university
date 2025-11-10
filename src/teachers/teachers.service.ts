import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Teacher } from "./models/teacher.model";
import { RegisterTeacherDto } from "../auth/dto/register-teacher.dto";
import { UpdateTeacherDto } from "./dto/update-teacher.dto";
import { FilterTeacherDto } from "./dto/filter-teacher.dto";
import { Department } from "../departments/models/department.model";
import { Op } from "sequelize";
import * as bcrypt from "bcrypt";

@Injectable()
export class TeacherService {
  constructor(
    @InjectModel(Teacher)
    private readonly teacherModel: typeof Teacher,
    @InjectModel(Department)
    private readonly departmentModel: typeof Department
  ) {}

  async create(registerTeacherDto: RegisterTeacherDto): Promise<Teacher> {
    if (!registerTeacherDto?.email || !registerTeacherDto?.password) {
      throw new BadRequestException("Email and password are required");
    }

    const department = await this.departmentModel.findByPk(
      registerTeacherDto.department_id
    );
    if (!department) {
      throw new NotFoundException("Department not found");
    }

    const existingTeacher = await this.teacherModel.findOne({
      where: {
        [Op.or]: [
          { email: registerTeacherDto.email },
          { phone: registerTeacherDto.phone },
        ],
      },
    });

    if (existingTeacher) {
      throw new ConflictException(
        "Teacher with this email or phone already exists"
      );
    }

    const hashedPassword = await bcrypt.hash(registerTeacherDto.password, 12);

    const teacher = await this.teacherModel.create({
      ...registerTeacherDto,
      password: hashedPassword,
      is_approved: false,
    });

    return this.findOne(teacher.id);
  }

  async findAll(filterDto: FilterTeacherDto): Promise<Teacher[]> {
    const whereClause: any = {};

    if (filterDto.search) {
      whereClause[Op.or] = [
        { full_name: { [Op.iLike]: `%${filterDto.search}%` } },
        { email: { [Op.iLike]: `%${filterDto.search}%` } },
      ];
    }

    if (filterDto.department_id) {
      whereClause.department_id = filterDto.department_id;
    }

    if (filterDto.is_active !== undefined) {
      whereClause.is_active = filterDto.is_active;
    }

    if (filterDto.is_approved !== undefined) {
      whereClause.is_approved = filterDto.is_approved;
    }

    if (filterDto.academic_degree) {
      whereClause.academic_degree = filterDto.academic_degree;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.teacherModel.findAll({
      where: whereClause,
      include: [
        {
          model: Department,
          attributes: ["id", "name", "code"],
        },
      ],
      attributes: {
        exclude: [
          "password",
          "refreshToken",
          "accessToken",
          "verification_otp",
        ],
      },
      order: [
        [filterDto.sort_by || "full_name", filterDto.sort_order || "ASC"],
      ],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<Teacher> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid teacher ID");
    }

    const teacher = await this.teacherModel.findByPk(id, {
      include: [
        {
          model: Department,
          attributes: ["id", "name", "code"],
        },
      ],
      attributes: {
        exclude: [
          "password",
          "refreshToken",
          "accessToken",
          "verification_otp",
        ],
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return teacher;
  }

  async findOneByEmail(email: string): Promise<Teacher> {
    if (!email) {
      throw new BadRequestException("Email is required");
    }

    const teacher = await this.teacherModel.findOne({
      where: { email },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with email ${email} not found`);
    }

    return teacher;
  }

  async update(
    id: number,
    updateTeacherDto: UpdateTeacherDto
  ): Promise<Teacher> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid teacher ID");
    }

    const teacher = await this.findOne(id);

    if (updateTeacherDto.email && updateTeacherDto.email !== teacher.email) {
      const existingTeacher = await this.teacherModel.findOne({
        where: {
          email: updateTeacherDto.email,
          id: { [Op.ne]: id },
        },
      });

      if (existingTeacher) {
        throw new ConflictException("Teacher with this email already exists");
      }
    }

    if (updateTeacherDto.phone && updateTeacherDto.phone !== teacher.phone) {
      const existingTeacher = await this.teacherModel.findOne({
        where: {
          phone: updateTeacherDto.phone,
          id: { [Op.ne]: id },
        },
      });

      if (existingTeacher) {
        throw new ConflictException("Teacher with this phone already exists");
      }
    }

    if (updateTeacherDto.department_id) {
      const department = await this.departmentModel.findByPk(
        updateTeacherDto.department_id
      );
      if (!department) {
        throw new NotFoundException("Department not found");
      }
    }

    if (updateTeacherDto.password) {
      updateTeacherDto.password = await bcrypt.hash(
        updateTeacherDto.password,
        12
      );
    }

    await teacher.update(updateTeacherDto);
    return this.findOne(id);
  }

  async updateTokens(
    teacherId: number,
    tokens: { accessToken?: string | null; refreshToken?: string | null }
  ): Promise<void> {
    if (!teacherId || isNaN(teacherId)) {
      throw new BadRequestException("Invalid teacher ID");
    }

    const updateData: any = {};

    if (tokens.accessToken !== undefined) {
      updateData.accessToken = tokens.accessToken;
    }

    if (tokens.refreshToken !== undefined) {
      updateData.refreshToken = tokens.refreshToken;
    }

    const [affectedRows] = await this.teacherModel.update(updateData, {
      where: { id: teacherId },
    });

    if (affectedRows === 0) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid teacher ID");
    }

    const teacher = await this.findOne(id);
    await teacher.destroy();

    return { message: "Teacher deleted successfully" };
  }

  async toggleStatus(id: number): Promise<Teacher> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid teacher ID");
    }

    const teacher = await this.findOne(id);
    await teacher.update({ is_active: !teacher.is_active });

    return this.findOne(id);
  }

  async approveTeacher(id: number): Promise<Teacher> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid teacher ID");
    }

    const teacher = await this.findOne(id);
    await teacher.update({ is_approved: true });

    return this.findOne(id);
  }

  async getTeachersCount(): Promise<{
    total: number;
    active: number;
    approved: number;
  }> {
    const total = await this.teacherModel.count();
    const active = await this.teacherModel.count({
      where: { is_active: true },
    });
    const approved = await this.teacherModel.count({
      where: { is_approved: true },
    });

    return { total, active, approved };
  }

  async getTeachersCountByDepartment(
    departmentId: number
  ): Promise<{ total: number; active: number }> {
    if (!departmentId || isNaN(departmentId)) {
      throw new BadRequestException("Invalid department ID");
    }

    const department = await this.departmentModel.findByPk(departmentId);
    if (!department) {
      throw new NotFoundException(
        `Department with ID ${departmentId} not found`
      );
    }

    const total = await this.teacherModel.count({
      where: { department_id: departmentId },
    });
    const active = await this.teacherModel.count({
      where: {
        department_id: departmentId,
        is_active: true,
      },
    });

    return { total, active };
  }
}
