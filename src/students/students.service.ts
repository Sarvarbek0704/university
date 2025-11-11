import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Student } from "./models/student.model";
import { RegisterStudentDto } from "../auth/dto/register-student.dto";
import { Op } from "sequelize";
import * as bcrypt from "bcrypt";
import { UpdateBalanceDto } from "./dto/update-balance.dto";

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Student)
    private readonly studentModel: typeof Student
  ) {}

  async create(registerStudentDto: RegisterStudentDto): Promise<Student> {
    try {
      const existingStudent = await this.studentModel.findOne({
        where: {
          [Op.or]: [
            { email: registerStudentDto.email },
            { phone: registerStudentDto.phone },
          ],
        },
      });

      if (existingStudent) {
        throw new ConflictException(
          "Student with this email or phone already exists"
        );
      }

      const hashedPassword = await bcrypt.hash(registerStudentDto.password, 12);

      const student = await this.studentModel.create({
        ...registerStudentDto,
        password: hashedPassword,
        is_approved: false,
      });

      return await this.findOne(student.id);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to create student");
    }
  }

  async findOneByEmail(email: string): Promise<Student> {
    try {
      const student = await this.studentModel.findOne({
        where: { email },
        raw: false,
      });

      if (!student) {
        throw new NotFoundException(`Student with email ${email} not found`);
      }

      return student;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        "Failed to fetch student by email"
      );
    }
  }

  async findOne(id: number): Promise<Student> {
    try {
      const student = await this.studentModel.findByPk(id, {
        // include: [{ model: Group }],
      });

      if (!student) {
        throw new NotFoundException(`Student with ID ${id} not found`);
      }

      return student;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to fetch student");
    }
  }

  async updateTokens(
    id: number,
    tokens: { accessToken?: string; refreshToken?: string }
  ): Promise<void> {
    try {
      const updateData: any = {};

      if (tokens.accessToken !== undefined) {
        updateData.accessToken = tokens.accessToken;
      }

      if (tokens.refreshToken !== undefined) {
        updateData.refreshToken = tokens.refreshToken;
      }

      await this.studentModel.update(updateData, { where: { id } });
    } catch (error) {
      throw new InternalServerErrorException("Failed to update tokens");
    }
  }

  async update(id: number, updateData: any): Promise<Student> {
    try {
      const student = await this.findOne(id);
      await student.update(updateData);
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to update student");
    }
  }

  async findAll(): Promise<Student[]> {
    try {
      return await this.studentModel.findAll({});
    } catch (error) {
      throw new InternalServerErrorException("Failed to fetch students");
    }
  }

  async approveStudent(id: number): Promise<Student> {
    try {
      const student = await this.findOne(id);
      await student.update({ is_approved: true });
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Failed to approve student");
    }
  }

  async updateBalance(
    studentId: number,
    updateBalanceDto: UpdateBalanceDto
  ): Promise<{ message: string; new_balance: number }> {
    if (!studentId || isNaN(studentId)) {
      throw new BadRequestException("Invalid student ID");
    }

    const student = await this.findOne(studentId);

    const newBalance =
      Number(student.balance) + Number(updateBalanceDto.amount);

    await student.update({
      balance: newBalance,
    });

    // Bu yerda transaction history ni saqlashingiz mumkin
    // await this.paymentService.createTransaction({
    //   student_id: studentId,
    //   amount: updateBalanceDto.amount,
    //   type: 'deposit',
    //   description: updateBalanceDto.description
    // });

    return {
      message: "Balance updated successfully",
      new_balance: newBalance,
    };
  }

  async getBalance(studentId: number): Promise<{ balance: number }> {
    if (!studentId || isNaN(studentId)) {
      throw new BadRequestException("Invalid student ID");
    }

    const student = await this.findOne(studentId);
    return { balance: Number(student.balance) };
  }
}
