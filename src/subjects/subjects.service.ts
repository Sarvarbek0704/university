import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Subject } from "./models/subject.model";
import { Department } from "../departments/models/department.model";
import { Teacher } from "../teachers/models/teacher.model";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { UpdateSubjectDto } from "./dto/update-subject.dto";
import { FilterSubjectDto } from "./dto/filter-subject.dto";
import { TeacherSubject } from "../teacher_subjects/models/teacher_subject.model";

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subject)
    private readonly subjectModel: typeof Subject,
    @InjectModel(Department)
    private readonly departmentModel: typeof Department
  ) {}

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    if (!createSubjectDto?.name) {
      throw new BadRequestException("Subject name is required");
    }

    if (createSubjectDto.department_id) {
      const department = await this.departmentModel.findByPk(
        createSubjectDto.department_id
      );
      if (!department) {
        throw new NotFoundException("Department not found");
      }
    }

    const subject = await this.subjectModel.create({
      name: createSubjectDto.name,
      credit: createSubjectDto.credit,
      department_id: createSubjectDto.department_id,
      semester_number: createSubjectDto.semester_number,
    } as any);

    return this.findOne(subject.id);
  }

  async findAll(filterDto: FilterSubjectDto): Promise<Subject[]> {
    const whereClause: any = {};

    if (filterDto.search) {
      whereClause.name = {
        [Op.iLike]: `%${filterDto.search}%`,
      };
    }

    if (filterDto.department_id) {
      whereClause.department_id = filterDto.department_id;
    }

    if (filterDto.semester_number) {
      whereClause.semester_number = filterDto.semester_number;
    }

    if (filterDto.is_active !== undefined) {
      whereClause.is_active = filterDto.is_active;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.subjectModel.findAll({
      where: whereClause,
      include: [
        {
          model: Department,
          attributes: ["id", "name"],
        },
      ],
      order: [[filterDto.sort_by || "name", filterDto.sort_order || "ASC"]],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<Subject> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid subject ID");
    }

    const subject = await this.subjectModel.findByPk(id, {
      include: [
        {
          model: Department,
          attributes: ["id", "name", "faculty_id"],
        },
      ],
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return subject;
  }

  async findByDepartment(departmentId: number): Promise<Subject[]> {
    if (!departmentId || isNaN(departmentId)) {
      throw new BadRequestException("Invalid department ID");
    }

    const department = await this.departmentModel.findByPk(departmentId);
    if (!department) {
      throw new NotFoundException(
        `Department with ID ${departmentId} not found`
      );
    }

    return this.subjectModel.findAll({
      where: {
        department_id: departmentId,
        is_active: true,
      },
      include: [
        {
          model: Department,
          attributes: ["id", "name"],
        },
      ],
      order: [["name", "ASC"]],
    });
  }

  async findBySemester(semesterNumber: number): Promise<Subject[]> {
    if (!semesterNumber || semesterNumber < 1 || semesterNumber > 8) {
      throw new BadRequestException("Invalid semester number");
    }

    return this.subjectModel.findAll({
      where: {
        semester_number: semesterNumber,
        is_active: true,
      },
      include: [
        {
          model: Department,
          attributes: ["id", "name"],
        },
      ],
      order: [["name", "ASC"]],
    });
  }

  async update(
    id: number,
    updateSubjectDto: UpdateSubjectDto
  ): Promise<Subject> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid subject ID");
    }

    const subject = await this.findOne(id);

    if (updateSubjectDto.department_id) {
      const department = await this.departmentModel.findByPk(
        updateSubjectDto.department_id
      );
      if (!department) {
        throw new NotFoundException("Department not found");
      }
    }

    await subject.update(updateSubjectDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid subject ID");
    }

    const subject = await this.findOne(id);

    const teacherSubjectsCount = await subject.$count("teacherSubjects");
    const schedulesCount = await subject.$count("schedules");
    const courseWorksCount = await subject.$count("courseWorks");
    const examsCount = await subject.$count("exams");

    if (
      teacherSubjectsCount > 0 ||
      schedulesCount > 0 ||
      courseWorksCount > 0 ||
      examsCount > 0
    ) {
      throw new ConflictException(
        "Cannot delete subject with related records (teachers, schedules, course works, or exams)"
      );
    }

    await subject.destroy();
    return { message: "Subject deleted successfully" };
  }

  async toggleStatus(id: number): Promise<Subject> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid subject ID");
    }

    const subject = await this.findOne(id);
    await subject.update({ is_active: !subject.is_active });

    return this.findOne(id);
  }

  async getSubjectWithTeachers(id: number): Promise<Subject> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid subject ID");
    }

    const subject = await this.subjectModel.findByPk(id, {
      include: [
        {
          model: Department,
          attributes: ["id", "name"],
        },
        {
          model: TeacherSubject,
          include: [
            {
              model: Teacher,
              attributes: ["id", "full_name", "email", "academic_degree"],
            },
          ],
        },
      ],
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return subject;
  }

  async getSubjectsCount(): Promise<{ total: number; active: number }> {
    const total = await this.subjectModel.count();
    const active = await this.subjectModel.count({
      where: { is_active: true },
    });

    return { total, active };
  }
}
