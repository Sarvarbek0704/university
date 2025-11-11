import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, fn, col } from "sequelize";
import { Scholarship } from "./models/scholarship.model";
import { Student } from "../students/models/student.model";
import { CreateScholarshipDto } from "./dto/create-scholarship.dto";
import { UpdateScholarshipDto } from "./dto/update-scholarship.dto";
import { FilterScholarshipDto } from "./dto/filter-scholarship.dto";

@Injectable()
export class ScholarshipsService {
  constructor(
    @InjectModel(Scholarship)
    private readonly scholarshipModel: typeof Scholarship,
    @InjectModel(Student)
    private readonly studentModel: typeof Student
  ) {} // ScholarshipTransaction ni olib tashladim, kerak emas

  async create(
    createScholarshipDto: CreateScholarshipDto
  ): Promise<Scholarship> {
    if (
      !createScholarshipDto?.student_id ||
      !createScholarshipDto?.scholarship_type
    ) {
      throw new BadRequestException(
        "Student ID and scholarship type are required"
      );
    }

    const student = await this.studentModel.findByPk(
      createScholarshipDto.student_id
    );
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    // Scholarship turi bo'yicha standart miqdorni o'rnatish
    const defaultAmount = Scholarship.getDefaultAmount(
      createScholarshipDto.scholarship_type
    );
    const finalAmount = createScholarshipDto.amount || defaultAmount;

    const existingScholarship = await this.scholarshipModel.findOne({
      where: {
        student_id: createScholarshipDto.student_id,
        scholarship_type: createScholarshipDto.scholarship_type,
        month: createScholarshipDto.month,
        year: createScholarshipDto.year,
      },
    });

    if (existingScholarship) {
      throw new ConflictException(
        "Scholarship for this student, type, month and year already exists"
      );
    }

    const scholarship = await this.scholarshipModel.create({
      student_id: createScholarshipDto.student_id,
      scholarship_type: createScholarshipDto.scholarship_type,
      amount: finalAmount,
      month: createScholarshipDto.month,
      year: createScholarshipDto.year,
      notes: createScholarshipDto.notes,
    } as any);

    return this.findOne(scholarship.id);
  }

  async findAll(filterDto: FilterScholarshipDto): Promise<Scholarship[]> {
    const whereClause: any = {};

    if (filterDto.student_id) {
      whereClause.student_id = filterDto.student_id;
    }

    if (filterDto.scholarship_type) {
      whereClause.scholarship_type = filterDto.scholarship_type;
    }

    if (filterDto.min_amount !== undefined) {
      whereClause.amount = {
        ...whereClause.amount,
        [Op.gte]: filterDto.min_amount,
      };
    }

    if (filterDto.max_amount !== undefined) {
      whereClause.amount = {
        ...whereClause.amount,
        [Op.lte]: filterDto.max_amount,
      };
    }

    if (filterDto.month_from && filterDto.month_to) {
      whereClause.month = {
        [Op.between]: [filterDto.month_from, filterDto.month_to],
      };
    }

    if (filterDto.is_active !== undefined) {
      whereClause.is_active = filterDto.is_active;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.scholarshipModel.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email", "balance"],
        },
      ],
      order: [[filterDto.sort_by || "month", filterDto.sort_order || "DESC"]],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<Scholarship> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid scholarship ID");
    }

    const scholarship = await this.scholarshipModel.findByPk(id, {
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email", "phone", "balance"],
        },
      ],
    });

    if (!scholarship) {
      throw new NotFoundException(`Scholarship with ID ${id} not found`);
    }

    return scholarship;
  }

  async findByStudent(studentId: number): Promise<Scholarship[]> {
    if (!studentId || isNaN(studentId)) {
      throw new BadRequestException("Invalid student ID");
    }

    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return this.scholarshipModel.findAll({
      where: {
        student_id: studentId,
        is_active: true,
      },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email"],
        },
      ],
      order: [["month", "DESC"]],
    });
  }

  async update(
    id: number,
    updateScholarshipDto: UpdateScholarshipDto
  ): Promise<Scholarship> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid scholarship ID");
    }

    const scholarship = await this.findOne(id);

    if (updateScholarshipDto.student_id) {
      const student = await this.studentModel.findByPk(
        updateScholarshipDto.student_id
      );
      if (!student) {
        throw new NotFoundException("Student not found");
      }
    }

    await scholarship.update(updateScholarshipDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid scholarship ID");
    }

    const scholarship = await this.findOne(id);
    await scholarship.destroy();

    return { message: "Scholarship deleted successfully" };
  }

  async toggleStatus(id: number): Promise<Scholarship> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid scholarship ID");
    }

    const scholarship = await this.findOne(id);
    await scholarship.update({ is_active: !scholarship.is_active });

    return this.findOne(id);
  }

  async getScholarshipsStats(): Promise<any> {
    const total = await this.scholarshipModel.count();
    const active = await this.scholarshipModel.count({
      where: { is_active: true },
    });

    try {
      const typeStats = await this.scholarshipModel.findAll({
        attributes: [
          "scholarship_type",
          [fn("COUNT", col("id")), "count"],
          [fn("SUM", col("amount")), "total_amount"],
        ],
        group: ["scholarship_type"],
        raw: true,
      });

      // total_amount ni to'g'ri ishlatish
      const totalAmount = typeStats.reduce(
        (sum, stat: any) => sum + parseFloat(stat.total_amount || "0"),
        0
      );

      return {
        total,
        active,
        by_type: typeStats,
        total_amount: totalAmount,
      };
    } catch (error) {
      // Agar SQL error bo'lsa, oddiy statistikani qaytarish
      const scholarships = await this.scholarshipModel.findAll();
      const totalAmount = scholarships.reduce(
        (sum, scholarship) =>
          sum + parseFloat(scholarship.amount?.toString() || "0"),
        0
      );

      const typeStats = scholarships.reduce((acc: any, scholarship) => {
        const type = scholarship.scholarship_type;
        if (!acc[type]) {
          acc[type] = { count: 0, total_amount: 0 };
        }
        acc[type].count++;
        acc[type].total_amount += parseFloat(
          scholarship.amount?.toString() || "0"
        );
        return acc;
      }, {});

      return {
        total,
        active,
        by_type: Object.entries(typeStats).map(
          ([type, stats]: [string, any]) => ({
            scholarship_type: type,
            count: stats.count,
            total_amount: stats.total_amount,
          })
        ),
        total_amount: totalAmount,
      };
    }
  }

  async getDefaultAmounts(): Promise<{ [key: string]: number }> {
    return {
      STATE_STANDARD: Scholarship.getDefaultAmount("STATE_STANDARD"),
      PRESIDENTIAL: Scholarship.getDefaultAmount("PRESIDENTIAL"),
      NAMED_SCHOLARSHIP: Scholarship.getDefaultAmount("NAMED_SCHOLARSHIP"),
      SOCIAL_SUPPORT: Scholarship.getDefaultAmount("SOCIAL_SUPPORT"),
      PRIVATE_FUNDED: Scholarship.getDefaultAmount("PRIVATE_FUNDED"),
      RESEARCH_GRANT: Scholarship.getDefaultAmount("RESEARCH_GRANT"),
    };
  }
}
