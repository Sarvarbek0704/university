import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, fn, col } from "sequelize";
import { Exam } from "./models/exam.model";
import { Subject } from "../subjects/models/subject.model";
import { Group } from "../groups/models/group.model";
import { Teacher } from "../teachers/models/teacher.model";
import { Student } from "../students/models/student.model";
import { CreateExamDto } from "./dto/create-exam.dto";
import { UpdateExamDto } from "./dto/update-exam.dto";
import { FilterExamDto } from "./dto/filter-exam.dto";
import { ExamScheduleDto } from "./dto/exam-schedule.dto";
import { ExamResult } from "../exam_results/models/exam_result.model";

@Injectable()
export class ExamsService {
  constructor(
    @InjectModel(Exam)
    private readonly examModel: typeof Exam,
    @InjectModel(Subject)
    private readonly subjectModel: typeof Subject,
    @InjectModel(Group)
    private readonly groupModel: typeof Group,
    @InjectModel(Teacher)
    private readonly teacherModel: typeof Teacher
  ) {}

  async create(createExamDto: CreateExamDto): Promise<Exam> {
    // Bog'liq modellarni tekshirish
    await this.validateRelatedEntities(createExamDto);

    // Bir xil guruh va fan uchun bir xil turdagi imtihon mavjudligini tekshirish
    const existingExam = await this.examModel.findOne({
      where: {
        subject_id: createExamDto.subject_id,
        group_id: createExamDto.group_id,
        exam_type: createExamDto.exam_type,
        exam_date: createExamDto.exam_date,
      },
    });

    if (existingExam) {
      throw new ConflictException(
        "Exam for this subject, group, type and date already exists"
      );
    }

    const exam = await this.examModel.create({
      subject_id: createExamDto.subject_id,
      group_id: createExamDto.group_id,
      teacher_id: createExamDto.teacher_id,
      exam_date: createExamDto.exam_date,
      exam_type: createExamDto.exam_type,
      max_score: createExamDto.max_score,
      location: createExamDto.location,
      instructions: createExamDto.instructions,
      start_time: createExamDto.start_time,
      end_time: createExamDto.end_time,
      duration_hours: createExamDto.duration_hours,
    } as any);

    return this.findOne(exam.id);
  }

  async findAll(filterDto: FilterExamDto): Promise<Exam[]> {
    const whereClause: any = {};

    if (filterDto.subject_id) {
      whereClause.subject_id = filterDto.subject_id;
    }

    if (filterDto.group_id) {
      whereClause.group_id = filterDto.group_id;
    }

    if (filterDto.teacher_id) {
      whereClause.teacher_id = filterDto.teacher_id;
    }

    if (filterDto.exam_type) {
      whereClause.exam_type = filterDto.exam_type;
    }

    if (filterDto.exam_date_from && filterDto.exam_date_to) {
      whereClause.exam_date = {
        [Op.between]: [filterDto.exam_date_from, filterDto.exam_date_to],
      };
    }

    if (filterDto.is_active !== undefined) {
      whereClause.is_active = filterDto.is_active;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.examModel.findAll({
      where: whereClause,
      include: [
        {
          model: Subject,
          attributes: ["id", "name", "credit"],
        },
        {
          model: Group,
          attributes: ["id", "name", "course_number"],
        },
        {
          model: Teacher,
          attributes: ["id", "full_name", "email"],
        },
      ],
      order: [
        [filterDto.sort_by || "exam_date", filterDto.sort_order || "ASC"],
      ],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<Exam> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid exam ID");
    }

    const exam = await this.examModel.findByPk(id, {
      include: [
        {
          model: Subject,
          attributes: ["id", "name", "credit", "semester_number"],
        },
        {
          model: Group,
          attributes: ["id", "name", "course_number"],
        },
        {
          model: Teacher,
          attributes: ["id", "full_name", "email", "phone"],
        },
        {
          model: ExamResult,
          include: [
            {
              model: Student,
              attributes: ["id", "full_name", "email"],
            },
          ],
        },
      ],
    });

    if (!exam) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
    }

    return exam;
  }

  async findByGroup(groupId: number): Promise<Exam[]> {
    if (!groupId || isNaN(groupId)) {
      throw new BadRequestException("Invalid group ID");
    }

    const group = await this.groupModel.findByPk(groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    return this.examModel.findAll({
      where: {
        group_id: groupId,
        is_active: true,
      },
      include: [
        {
          model: Subject,
          attributes: ["id", "name", "credit"],
        },
        {
          model: Teacher,
          attributes: ["id", "full_name"],
        },
      ],
      order: [["exam_date", "ASC"]],
    });
  }

  async findByTeacher(teacherId: number): Promise<Exam[]> {
    if (!teacherId || isNaN(teacherId)) {
      throw new BadRequestException("Invalid teacher ID");
    }

    const teacher = await this.teacherModel.findByPk(teacherId);
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    return this.examModel.findAll({
      where: {
        teacher_id: teacherId,
        is_active: true,
      },
      include: [
        {
          model: Subject,
          attributes: ["id", "name"],
        },
        {
          model: Group,
          attributes: ["id", "name"],
        },
      ],
      order: [["exam_date", "ASC"]],
    });
  }

  async findBySubject(subjectId: number): Promise<Exam[]> {
    if (!subjectId || isNaN(subjectId)) {
      throw new BadRequestException("Invalid subject ID");
    }

    const subject = await this.subjectModel.findByPk(subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    return this.examModel.findAll({
      where: {
        subject_id: subjectId,
        is_active: true,
      },
      include: [
        {
          model: Group,
          attributes: ["id", "name"],
        },
        {
          model: Teacher,
          attributes: ["id", "full_name"],
        },
      ],
      order: [["exam_date", "ASC"]],
    });
  }

  async getUpcomingExams(days: number = 30): Promise<Exam[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.examModel.findAll({
      where: {
        exam_date: {
          [Op.between]: [today, futureDate],
        },
        is_active: true,
      },
      include: [
        {
          model: Subject,
          attributes: ["id", "name"],
        },
        {
          model: Group,
          attributes: ["id", "name"],
        },
        {
          model: Teacher,
          attributes: ["id", "full_name"],
        },
      ],
      order: [["exam_date", "ASC"]],
    });
  }

  async update(id: number, updateExamDto: UpdateExamDto): Promise<Exam> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid exam ID");
    }

    const exam = await this.findOne(id);

    // Yangilanishlar bo'lsa, bog'liq modellarni tekshirish
    if (
      updateExamDto.subject_id ||
      updateExamDto.group_id ||
      updateExamDto.teacher_id
    ) {
      await this.validateRelatedEntities({
        subject_id: updateExamDto.subject_id || exam.subject_id,
        group_id: updateExamDto.group_id || exam.group_id,
        teacher_id: updateExamDto.teacher_id || exam.teacher_id,
      } as any);
    }

    // Bir xil guruh va fan uchun bir xil turdagi imtihon mavjudligini tekshirish
    if (
      updateExamDto.subject_id ||
      updateExamDto.group_id ||
      updateExamDto.exam_type ||
      updateExamDto.exam_date
    ) {
      const existingExam = await this.examModel.findOne({
        where: {
          subject_id: updateExamDto.subject_id || exam.subject_id,
          group_id: updateExamDto.group_id || exam.group_id,
          exam_type: updateExamDto.exam_type || exam.exam_type,
          exam_date: updateExamDto.exam_date || exam.exam_date,
          id: { [Op.ne]: id },
        },
      });

      if (existingExam) {
        throw new ConflictException(
          "Another exam for this subject, group, type and date already exists"
        );
      }
    }

    await exam.update(updateExamDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid exam ID");
    }

    const exam = await this.findOne(id);

    // Exam ga bog'liq natijalar mavjudligini tekshirish
    const resultsCount = await exam.$count("exam_results");
    const attemptsCount = await exam.$count("exam_attempts");

    if (resultsCount > 0 || attemptsCount > 0) {
      throw new ConflictException(
        "Cannot delete exam with existing results or attempts"
      );
    }

    await exam.destroy();
    return { message: "Exam deleted successfully" };
  }

  async toggleStatus(id: number): Promise<Exam> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid exam ID");
    }

    const exam = await this.findOne(id);
    await exam.update({ is_active: !exam.is_active });

    return this.findOne(id);
  }

  // ========== SCHEDULE METHODS ==========

  async getExamSchedule(scheduleDto: ExamScheduleDto): Promise<any> {
    const whereClause: any = {
      exam_date: {
        [Op.between]: [scheduleDto.start_date, scheduleDto.end_date],
      },
      is_active: true,
    };

    if (scheduleDto.group_id) {
      whereClause.group_id = scheduleDto.group_id;
    }

    if (scheduleDto.teacher_id) {
      whereClause.teacher_id = scheduleDto.teacher_id;
    }

    if (scheduleDto.exam_type) {
      whereClause.exam_type = scheduleDto.exam_type;
    }

    const exams = await this.examModel.findAll({
      where: whereClause,
      include: [
        {
          model: Subject,
          attributes: ["id", "name", "credit"],
        },
        {
          model: Group,
          attributes: ["id", "name"],
        },
        {
          model: Teacher,
          attributes: ["id", "full_name"],
        },
      ],
      order: [
        ["exam_date", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    // Kunlik jadval strukturasini yaratish
    const schedule: any = {};
    const currentDate = new Date(scheduleDto.start_date);
    const endDate = new Date(scheduleDto.end_date);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const dayExams = exams.filter(
        (exam) => exam.exam_date.toISOString().split("T")[0] === dateStr
      );

      schedule[dateStr] = {
        date: dateStr,
        day_name: currentDate.toLocaleDateString("en-US", { weekday: "long" }),
        exams: dayExams.map((exam) => ({
          id: exam.id,
          subject: exam.subject.name,
          group: exam.group.name,
          teacher: exam.teacher.full_name,
          type: exam.exam_type,
          time: exam.timeRange,
          location: exam.location,
          max_score: exam.max_score,
        })),
      };

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      period: {
        start_date: scheduleDto.start_date,
        end_date: scheduleDto.end_date,
      },
      filters: {
        group_id: scheduleDto.group_id,
        teacher_id: scheduleDto.teacher_id,
        exam_type: scheduleDto.exam_type,
      },
      schedule,
    };
  }

  async getExamStats(): Promise<any> {
    const total = await this.examModel.count();
    const active = await this.examModel.count({ where: { is_active: true } });
    const upcoming = await this.examModel.count({
      where: {
        is_active: true,
        exam_date: { [Op.gte]: new Date() },
      },
    });

    const typeStats = await this.examModel.findAll({
      attributes: ["exam_type", [fn("COUNT", col("id")), "count"]],
      where: { is_active: true },
      group: ["exam_type"],
      raw: true,
    });

    const monthlyStats = await this.examModel.findAll({
      attributes: [
        [fn("DATE_TRUNC", "month", col("exam_date")), "month"],
        [fn("COUNT", col("id")), "count"],
      ],
      where: { is_active: true },
      group: [fn("DATE_TRUNC", "month", col("exam_date"))],
      order: [[fn("DATE_TRUNC", "month", col("exam_date")), "ASC"]],
      raw: true,
    });

    return {
      total,
      active,
      upcoming,
      by_type: typeStats,
      by_month: monthlyStats,
    };
  }

  async getTeacherExamWorkload(
    teacherId: number,
    startDate: string,
    endDate: string
  ): Promise<any> {
    const exams = await this.examModel.findAll({
      where: {
        teacher_id: teacherId,
        exam_date: {
          [Op.between]: [startDate, endDate],
        },
        is_active: true,
      },
      include: [
        {
          model: Subject,
          attributes: ["id", "name"],
        },
        {
          model: Group,
          attributes: ["id", "name"],
        },
      ],
      order: [["exam_date", "ASC"]],
    });

    const teacher = await this.teacherModel.findByPk(teacherId);

    const workloadByType = exams.reduce((acc: any, exam) => {
      if (!acc[exam.exam_type]) {
        acc[exam.exam_type] = 0;
      }
      acc[exam.exam_type]++;
      return acc;
    }, {});

    return {
      teacher: {
        id: teacher!.id,
        full_name: teacher!.full_name,
      },
      period: {
        start_date: startDate,
        end_date: endDate,
      },
      total_exams: exams.length,
      workload_by_type: workloadByType,
      exams: exams.map((exam) => ({
        id: exam.id,
        subject: exam.subject.name,
        group: exam.group.name,
        type: exam.exam_type,
        date: exam.formattedExamDate,
        time: exam.timeRange,
      })),
    };
  }

  // ========== UTILITY METHODS ==========

  private async validateRelatedEntities(dto: {
    subject_id: number;
    group_id: number;
    teacher_id: number;
  }): Promise<void> {
    const [subject, group, teacher] = await Promise.all([
      this.subjectModel.findByPk(dto.subject_id),
      this.groupModel.findByPk(dto.group_id),
      this.teacherModel.findByPk(dto.teacher_id),
    ]);

    if (!subject) throw new NotFoundException("Subject not found");
    if (!group) throw new NotFoundException("Group not found");
    if (!teacher) throw new NotFoundException("Teacher not found");
  }

  async getExamConflicts(
    teacherId: number,
    examDate: string,
    startTime?: string,
    endTime?: string
  ): Promise<{ hasConflicts: boolean; conflicts: any[] }> {
    const whereClause: any = {
      teacher_id: teacherId,
      exam_date: examDate,
      is_active: true,
    };

    const teacherExams = await this.examModel.findAll({
      where: whereClause,
      include: [
        {
          model: Subject,
          attributes: ["id", "name"],
        },
        {
          model: Group,
          attributes: ["id", "name"],
        },
      ],
    });

    const conflicts: any[] = [];

    if (startTime && endTime) {
      const newStart = new Date(`1970-01-01T${startTime}`);
      const newEnd = new Date(`1970-01-01T${endTime}`);

      teacherExams.forEach((exam) => {
        if (exam.start_time && exam.end_time) {
          const examStart = new Date(`1970-01-01T${exam.start_time}`);
          const examEnd = new Date(`1970-01-01T${exam.end_time}`);

          const timeConflict = newStart < examEnd && newEnd > examStart;

          if (timeConflict) {
            conflicts.push({
              exam_id: exam.id,
              subject: exam.subject.name,
              group: exam.group.name,
              time: `${exam.start_time} - ${exam.end_time}`,
              conflict_type: "TIME_CONFLICT",
            });
          }
        }
      });
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
    };
  }
}
