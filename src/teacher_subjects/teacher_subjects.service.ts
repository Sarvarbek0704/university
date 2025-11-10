import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
// import { TeacherSubject } from "./models/teacher-subject.model";
import { Teacher } from "../teachers/models/teacher.model";
import { Subject } from "../subjects/models/subject.model";
import { CreateTeacherSubjectDto } from "./dto/create-teacher_subject.dto";
import { UpdateTeacherSubjectDto } from "./dto/update-teacher_subject.dto";
import { TeacherSubject } from "./models/teacher_subject.mdoel";

@Injectable()
export class TeacherSubjectsService {
  constructor(
    @InjectModel(TeacherSubject)
    private readonly teacherSubjectModel: typeof TeacherSubject,
    @InjectModel(Teacher)
    private readonly teacherModel: typeof Teacher,
    @InjectModel(Subject)
    private readonly subjectModel: typeof Subject
  ) {}

  async create(
    createTeacherSubjectDto: CreateTeacherSubjectDto
  ): Promise<TeacherSubject> {
    if (
      !createTeacherSubjectDto?.teacher_id ||
      !createTeacherSubjectDto?.subject_id
    ) {
      throw new BadRequestException("Teacher ID and Subject ID are required");
    }

    // Check if teacher exists
    const teacher = await this.teacherModel.findByPk(
      createTeacherSubjectDto.teacher_id
    );
    if (!teacher) {
      throw new NotFoundException("Teacher not found");
    }

    // Check if subject exists
    const subject = await this.subjectModel.findByPk(
      createTeacherSubjectDto.subject_id
    );
    if (!subject) {
      throw new NotFoundException("Subject not found");
    }

    // Check if assignment already exists
    const existingAssignment = await this.teacherSubjectModel.findOne({
      where: {
        teacher_id: createTeacherSubjectDto.teacher_id,
        subject_id: createTeacherSubjectDto.subject_id,
      },
    });

    if (existingAssignment) {
      throw new ConflictException("Teacher already has this subject assigned");
    }

    const teacherSubject = await this.teacherSubjectModel.create({
      teacher_id: createTeacherSubjectDto.teacher_id,
      subject_id: createTeacherSubjectDto.subject_id,
    } as any);

    return this.findOne(teacherSubject.id);
  }

  async findAll(): Promise<TeacherSubject[]> {
    return this.teacherSubjectModel.findAll({
      include: [
        {
          model: Teacher,
          attributes: ["id", "full_name", "email", "academic_degree"],
        },
        {
          model: Subject,
          attributes: ["id", "name", "credit"],
        },
      ],
      order: [["id", "ASC"]],
    });
  }

  async findOne(id: number): Promise<TeacherSubject> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid teacher-subject ID");
    }

    const teacherSubject = await this.teacherSubjectModel.findByPk(id, {
      include: [
        {
          model: Teacher,
          attributes: [
            "id",
            "full_name",
            "email",
            "academic_degree",
            "position",
          ],
        },
        {
          model: Subject,
          attributes: ["id", "name", "credit", "semester_number"],
          include: ["department"],
        },
      ],
    });

    if (!teacherSubject) {
      throw new NotFoundException(
        `Teacher-Subject assignment with ID ${id} not found`
      );
    }

    return teacherSubject;
  }

  async findByTeacher(teacherId: number): Promise<TeacherSubject[]> {
    if (!teacherId || isNaN(teacherId)) {
      throw new BadRequestException("Invalid teacher ID");
    }

    const teacher = await this.teacherModel.findByPk(teacherId);
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    return this.teacherSubjectModel.findAll({
      where: {
        teacher_id: teacherId,
        is_active: true,
      },
      include: [
        {
          model: Subject,
          attributes: ["id", "name", "credit", "semester_number"],
          include: [
            {
              model: Subject.associations.department.target,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [[{ model: Subject, as: "subject" }, "name", "ASC"]],
    });
  }

  async findBySubject(subjectId: number): Promise<TeacherSubject[]> {
    if (!subjectId || isNaN(subjectId)) {
      throw new BadRequestException("Invalid subject ID");
    }

    const subject = await this.subjectModel.findByPk(subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    return this.teacherSubjectModel.findAll({
      where: {
        subject_id: subjectId,
        is_active: true,
      },
      include: [
        {
          model: Teacher,
          attributes: [
            "id",
            "full_name",
            "email",
            "academic_degree",
            "position",
          ],
        },
      ],
      order: [[{ model: Teacher, as: "teacher" }, "full_name", "ASC"]],
    });
  }

  async update(
    id: number,
    updateTeacherSubjectDto: UpdateTeacherSubjectDto
  ): Promise<TeacherSubject> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid teacher-subject ID");
    }

    const teacherSubject = await this.findOne(id);

    if (
      updateTeacherSubjectDto.teacher_id ||
      updateTeacherSubjectDto.subject_id
    ) {
      const teacherId =
        updateTeacherSubjectDto.teacher_id || teacherSubject.teacher_id;
      const subjectId =
        updateTeacherSubjectDto.subject_id || teacherSubject.subject_id;

      // Check if new assignment already exists
      const existingAssignment = await this.teacherSubjectModel.findOne({
        where: {
          teacher_id: teacherId,
          subject_id: subjectId,
          id: { [Op.ne]: id },
        },
      });

      if (existingAssignment) {
        throw new ConflictException(
          "Teacher already has this subject assigned"
        );
      }

      // Check if teacher exists
      if (updateTeacherSubjectDto.teacher_id) {
        const teacher = await this.teacherModel.findByPk(
          updateTeacherSubjectDto.teacher_id
        );
        if (!teacher) {
          throw new NotFoundException("Teacher not found");
        }
      }

      // Check if subject exists
      if (updateTeacherSubjectDto.subject_id) {
        const subject = await this.subjectModel.findByPk(
          updateTeacherSubjectDto.subject_id
        );
        if (!subject) {
          throw new NotFoundException("Subject not found");
        }
      }
    }

    await teacherSubject.update(updateTeacherSubjectDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid teacher-subject ID");
    }

    const teacherSubject = await this.findOne(id);
    await teacherSubject.destroy();

    return { message: "Teacher-subject assignment removed successfully" };
  }

  async removeByTeacherAndSubject(
    teacherId: number,
    subjectId: number
  ): Promise<{ message: string }> {
    if (!teacherId || isNaN(teacherId) || !subjectId || isNaN(subjectId)) {
      throw new BadRequestException("Invalid teacher ID or subject ID");
    }

    const teacherSubject = await this.teacherSubjectModel.findOne({
      where: {
        teacher_id: teacherId,
        subject_id: subjectId,
      },
    });

    if (!teacherSubject) {
      throw new NotFoundException("Teacher-subject assignment not found");
    }

    await teacherSubject.destroy();
    return { message: "Teacher-subject assignment removed successfully" };
  }

  async toggleStatus(id: number): Promise<TeacherSubject> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid teacher-subject ID");
    }

    const teacherSubject = await this.findOne(id);
    await teacherSubject.update({ is_active: !teacherSubject.is_active });

    return this.findOne(id);
  }

  async getTeacherSubjectsCount(teacherId: number): Promise<number> {
    if (!teacherId || isNaN(teacherId)) {
      throw new BadRequestException("Invalid teacher ID");
    }

    return this.teacherSubjectModel.count({
      where: {
        teacher_id: teacherId,
        is_active: true,
      },
    });
  }

  async getSubjectTeachersCount(subjectId: number): Promise<number> {
    if (!subjectId || isNaN(subjectId)) {
      throw new BadRequestException("Invalid subject ID");
    }

    return this.teacherSubjectModel.count({
      where: {
        subject_id: subjectId,
        is_active: true,
      },
    });
  }
}
