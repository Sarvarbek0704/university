import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Internship } from "./models/internship.model";
import { Student } from "../students/models/student.model";
import { CreateInternshipDto } from "./dto/create-internship.dto";
import { UpdateInternshipDto } from "./dto/update-internship.dto";

@Injectable()
export class InternshipsService {
  constructor(
    @InjectModel(Internship)
    private readonly internshipModel: typeof Internship,
    @InjectModel(Student)
    private readonly studentModel: typeof Student
  ) {}

  async create(createInternshipDto: CreateInternshipDto): Promise<Internship> {
    const student = await this.studentModel.findByPk(
      createInternshipDto.student_id
    );
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    const startDate = new Date(createInternshipDto.start_date);
    const endDate = new Date(createInternshipDto.end_date);

    if (endDate <= startDate) {
      throw new BadRequestException("End date must be after start date");
    }

    return this.internshipModel.create({
      ...createInternshipDto,
      status: "IN_PROGRESS",
    });
  }

  async findAll(): Promise<Internship[]> {
    return this.internshipModel.findAll({
      include: [Student],
      order: [["start_date", "DESC"]],
    });
  }

  async findActive(): Promise<Internship[]> {
    const today = new Date();
    return this.internshipModel.findAll({
      where: {
        start_date: { [Op.lte]: today },
        end_date: { [Op.gte]: today },
        status: "IN_PROGRESS",
      },
      include: [Student],
      order: [["end_date", "ASC"]],
    });
  }

  async findByStudent(studentId: number): Promise<Internship[]> {
    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    return this.internshipModel.findAll({
      where: { student_id: studentId },
      include: [Student],
      order: [["start_date", "DESC"]],
    });
  }

  async findOne(id: number): Promise<Internship> {
    const internship = await this.internshipModel.findByPk(id, {
      include: [Student],
    });

    if (!internship) {
      throw new NotFoundException(`Internship with ID ${id} not found`);
    }

    return internship;
  }

  async update(
    id: number,
    updateInternshipDto: UpdateInternshipDto
  ): Promise<Internship> {
    const internship = await this.findOne(id);
    await internship.update(updateInternshipDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const internship = await this.findOne(id);
    await internship.destroy();
    return { message: "Internship deleted successfully" };
  }

  async complete(
    id: number,
    grade: string,
    feedback?: string
  ): Promise<Internship> {
    const internship = await this.findOne(id);

    if (internship.isCompleted) {
      throw new BadRequestException("Internship already completed");
    }

    await internship.update({
      status: "COMPLETED",
      grade: grade,
      feedback: feedback,
    });

    return this.findOne(id);
  }
}
