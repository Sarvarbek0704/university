import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, fn, col, literal } from "sequelize";
import { FailedSubject } from "./models/failed_subject.model";
import { Student } from "../students/models/student.model";
import { Subject } from "../subjects/models/subject.model";
import { ExamAttempt } from "../exam_attempts/models/exam_attempt.model";
import { Group } from "../groups/models/group.model";
import { Faculty } from "../faculties/models/faculty.model";
import { Department } from "../departments/models/department.model";
import { ExamResult } from "../exam_results/models/exam_result.model";
import { CreateFailedSubjectDto } from "./dto/create-failed_subject.dto";
import { UpdateFailedSubjectDto } from "./dto/update-failed_subject.dto";
import { FilterFailedSubjectDto } from "./dto/filter-failed-subject.dto";
import { FailedSubjectStatsDto } from "./dto/failed-subject-stats.dto";
import { RetakePlanDto } from "./dto/retake-plan.dto";
import { Exam } from "../exams/models/exam.model";

@Injectable()
export class FailedSubjectsService {
  constructor(
    @InjectModel(FailedSubject)
    private readonly failedSubjectModel: typeof FailedSubject,
    @InjectModel(Student)
    private readonly studentModel: typeof Student,
    @InjectModel(Subject)
    private readonly subjectModel: typeof Subject,
    @InjectModel(ExamAttempt)
    private readonly examAttemptModel: typeof ExamAttempt,
    @InjectModel(Group)
    private readonly groupModel: typeof Group,
    @InjectModel(Faculty)
    private readonly facultyModel: typeof Faculty,
    @InjectModel(Department)
    private readonly departmentModel: typeof Department,
    @InjectModel(ExamResult)
    private readonly examResultModel: typeof ExamResult
  ) {}

  async create(
    createFailedSubjectDto: CreateFailedSubjectDto
  ): Promise<FailedSubject> {
    // Talaba, fan va imtihon urinishini tekshirish
    await this.validateRelatedEntities(
      createFailedSubjectDto.student_id,
      createFailedSubjectDto.subject_id,
      createFailedSubjectDto.exam_attempt_id
    );

    // Bir xil talaba, fan va imtihon urinishi uchun mavjudlikni tekshirish
    const existingFailedSubject = await this.failedSubjectModel.findOne({
      where: {
        student_id: createFailedSubjectDto.student_id,
        subject_id: createFailedSubjectDto.subject_id,
        exam_attempt_id: createFailedSubjectDto.exam_attempt_id,
      },
    });

    if (existingFailedSubject) {
      throw new ConflictException(
        "Failed subject record for this student, subject and exam attempt already exists"
      );
    }

    const failedSubject = await this.failedSubjectModel.create({
      student_id: createFailedSubjectDto.student_id,
      subject_id: createFailedSubjectDto.subject_id,
      exam_attempt_id: createFailedSubjectDto.exam_attempt_id,
      fail_reason: createFailedSubjectDto.fail_reason,
      retake_required: createFailedSubjectDto.retake_required ?? true,
      retake_semester: createFailedSubjectDto.retake_semester,
      notes: createFailedSubjectDto.notes,
      planned_retake_date: createFailedSubjectDto.planned_retake_date,
      failed_score: createFailedSubjectDto.failed_score,
    } as any);

    return this.findOne(failedSubject.id);
  }

  async autoDetectFailedSubjects(
    passingScore: number = 60,
    semester?: number
  ): Promise<{ detected: number; created: number; errors: string[] }> {
    const result = {
      detected: 0,
      created: 0,
      errors: [] as string[],
    };

    // Muvaffaqiyatsiz imtihon natijalarini topish
    const whereClause: any = {
      score: {
        [Op.lt]: passingScore,
      },
    };

    if (semester) {
      whereClause["$exam.subject.semester_number$"] = semester;
    }

    const failedExamResults = await this.examResultModel.findAll({
      where: whereClause,
      include: [
        {
          model: Exam,
          include: [
            {
              model: Subject,
              attributes: ["id", "name", "semester_number"],
            },
          ],
        },
        {
          model: Student,
          attributes: ["id", "full_name"],
        },
      ],
    });

    result.detected = failedExamResults.length;

    for (const examResult of failedExamResults) {
      try {
        // Mavjud failed subject ni tekshirish
        const existingFailedSubject = await this.failedSubjectModel.findOne({
          where: {
            student_id: examResult.student_id,
            subject_id: examResult.exam.subject_id,
          },
        });

        if (!existingFailedSubject) {
          // Eng oxirgi imtihon urinishini topish
          const latestAttempt = await this.examAttemptModel.findOne({
            where: {
              student_id: examResult.student_id,
              exam_id: examResult.exam_id,
            },
            order: [["attempt_number", "DESC"]],
          });

          if (latestAttempt) {
            await this.failedSubjectModel.create({
              student_id: examResult.student_id,
              subject_id: examResult.exam.subject_id,
              exam_attempt_id: latestAttempt.id,
              fail_reason: "LOW_SCORE",
              retake_required: latestAttempt.attempt_number < 4, // 4 - final attempt
              retake_semester: examResult.exam.subject.semester_number,
              failed_score: examResult.score,
              notes: `Automatically detected from exam result. Score: ${examResult.score}`,
            } as any);
            result.created++;
          }
        }
      } catch (error) {
        result.errors.push(
          `Student ${examResult.student_id}, Subject ${examResult.exam.subject_id}: ${error.message}`
        );
      }
    }

    return result;
  }

  async createRetakePlan(
    retakePlanDto: RetakePlanDto
  ): Promise<{ planned: number; errors: string[] }> {
    const result = {
      planned: 0,
      errors: [] as string[],
    };

    // Talabani tekshirish
    const student = await this.studentModel.findByPk(retakePlanDto.student_id);
    if (!student) {
      throw new NotFoundException(
        `Student with ID ${retakePlanDto.student_id} not found`
      );
    }

    for (const retakeItem of retakePlanDto.retake_items) {
      try {
        const failedSubject = await this.failedSubjectModel.findByPk(
          retakeItem.failed_subject_id,
          {
            include: [
              {
                model: Student,
                attributes: ["id"],
              },
            ],
          }
        );

        if (!failedSubject) {
          result.errors.push(
            `Failed subject with ID ${retakeItem.failed_subject_id} not found`
          );
          continue;
        }

        // Talaba mosligini tekshirish
        if (failedSubject.student_id !== retakePlanDto.student_id) {
          result.errors.push(
            `Failed subject ${retakeItem.failed_subject_id} does not belong to student ${retakePlanDto.student_id}`
          );
          continue;
        }

        // Qayta topshirishni rejalashtirish
        await failedSubject.update({
          planned_retake_date: retakeItem.planned_date,
          retake_semester: retakePlanDto.semester,
          retake_required: true,
          is_resolved: false,
          notes: retakeItem.notes
            ? `${failedSubject.notes || ""} | ${retakeItem.notes}`.trim()
            : failedSubject.notes,
        });

        result.planned++;
      } catch (error) {
        result.errors.push(
          `Failed subject ${retakeItem.failed_subject_id}: ${error.message}`
        );
      }
    }

    return result;
  }

  async findAll(filterDto: FilterFailedSubjectDto): Promise<FailedSubject[]> {
    const whereClause: any = {};

    if (filterDto.student_id) {
      whereClause.student_id = filterDto.student_id;
    }

    if (filterDto.subject_id) {
      whereClause.subject_id = filterDto.subject_id;
    }

    if (filterDto.fail_reason) {
      whereClause.fail_reason = filterDto.fail_reason;
    }

    if (filterDto.retake_required !== undefined) {
      whereClause.retake_required = filterDto.retake_required;
    }

    if (filterDto.is_resolved !== undefined) {
      whereClause.is_resolved = filterDto.is_resolved;
    }

    if (filterDto.retake_semester) {
      whereClause.retake_semester = filterDto.retake_semester;
    }

    if (filterDto.group_id) {
      whereClause["$student.group_id$"] = filterDto.group_id;
    }

    if (filterDto.date_from && filterDto.date_to) {
      whereClause.createdAt = {
        [Op.between]: [filterDto.date_from, filterDto.date_to],
      };
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.failedSubjectModel.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email"],
          include: [
            {
              model: Group,
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Subject,
          attributes: ["id", "name", "credit", "semester_number"],
        },
        {
          model: ExamAttempt,
          attributes: ["id", "attempt_number", "score", "status"],
        },
      ],
      order: [
        [filterDto.sort_by || "createdAt", filterDto.sort_order || "DESC"],
      ],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<FailedSubject> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid failed subject ID");
    }

    const failedSubject = await this.failedSubjectModel.findByPk(id, {
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email", "phone"],
          include: [
            {
              model: Group,
              attributes: ["id", "name", "course_number"],
              include: [
                {
                  model: Department,
                  attributes: ["id", "name"],
                  include: [
                    {
                      model: Faculty,
                      attributes: ["id", "name"],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Subject,
          attributes: [
            "id",
            "name",
            "credit",
            "semester_number",
            "description",
          ],
        },
        {
          model: ExamAttempt,
          include: [
            {
              model: Exam,
              attributes: ["id", "exam_type", "exam_date"],
            },
          ],
        },
      ],
    });

    if (!failedSubject) {
      throw new NotFoundException(`Failed subject with ID ${id} not found`);
    }

    return failedSubject;
  }

  async findByStudent(studentId: number): Promise<FailedSubject[]> {
    if (!studentId || isNaN(studentId)) {
      throw new BadRequestException("Invalid student ID");
    }

    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return this.failedSubjectModel.findAll({
      where: {
        student_id: studentId,
      },
      include: [
        {
          model: Subject,
          attributes: ["id", "name", "credit", "semester_number"],
        },
        {
          model: ExamAttempt,
          attributes: ["id", "attempt_number", "score", "status"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  async findActiveByStudent(studentId: number): Promise<FailedSubject[]> {
    if (!studentId || isNaN(studentId)) {
      throw new BadRequestException("Invalid student ID");
    }

    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return this.failedSubjectModel.findAll({
      where: {
        student_id: studentId,
        is_resolved: false,
      },
      include: [
        {
          model: Subject,
          attributes: ["id", "name", "credit", "semester_number"],
        },
        {
          model: ExamAttempt,
          attributes: ["id", "attempt_number", "score"],
        },
      ],
      order: [
        ["retake_required", "DESC"],
        ["planned_retake_date", "ASC"],
      ],
    });
  }

  async findBySubject(subjectId: number): Promise<FailedSubject[]> {
    if (!subjectId || isNaN(subjectId)) {
      throw new BadRequestException("Invalid subject ID");
    }

    const subject = await this.subjectModel.findByPk(subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    return this.failedSubjectModel.findAll({
      where: {
        subject_id: subjectId,
      },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email"],
          include: [
            {
              model: Group,
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: ExamAttempt,
          attributes: ["id", "attempt_number", "score"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  async findByGroup(groupId: number): Promise<FailedSubject[]> {
    if (!groupId || isNaN(groupId)) {
      throw new BadRequestException("Invalid group ID");
    }

    const group = await this.groupModel.findByPk(groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    return this.failedSubjectModel.findAll({
      where: {
        "$student.group_id$": groupId,
      },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email"],
        },
        {
          model: Subject,
          attributes: ["id", "name", "credit"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  async update(
    id: number,
    updateFailedSubjectDto: UpdateFailedSubjectDto
  ): Promise<FailedSubject> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid failed subject ID");
    }

    const failedSubject = await this.findOne(id);
    await failedSubject.update(updateFailedSubjectDto);
    return this.findOne(id);
  }

  async markAsResolved(
    id: number,
    resolutionNotes?: string
  ): Promise<FailedSubject> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid failed subject ID");
    }

    const failedSubject = await this.findOne(id);

    if (failedSubject.is_resolved) {
      throw new BadRequestException("Failed subject is already resolved");
    }

    await failedSubject.update({
      is_resolved: true,
      resolved_at: new Date(),
      resolution_notes: resolutionNotes,
    });

    return this.findOne(id);
  }

  async scheduleRetake(
    id: number,
    retakeDate: string,
    semester?: number
  ): Promise<FailedSubject> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid failed subject ID");
    }

    const failedSubject = await this.findOne(id);

    if (failedSubject.isMaxAttempts) {
      throw new BadRequestException(
        "Cannot schedule retake for exceeded attempts"
      );
    }

    const updateData: any = {
      planned_retake_date: retakeDate,
      retake_required: true,
      is_resolved: false,
      resolved_at: null,
    };

    if (semester) {
      updateData.retake_semester = semester;
    }

    await failedSubject.update(updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid failed subject ID");
    }

    const failedSubject = await this.findOne(id);
    await failedSubject.destroy();

    return { message: "Failed subject deleted successfully" };
  }

  // ========== STATISTICS METHODS ==========

  async getFailedSubjectStats(statsDto: FailedSubjectStatsDto): Promise<any> {
    const whereClause: any = {
      createdAt: {
        [Op.between]: [statsDto.start_date, statsDto.end_date],
      },
    };

    if (statsDto.student_id) {
      whereClause.student_id = statsDto.student_id;
    }

    if (statsDto.group_id) {
      whereClause["$student.group_id$"] = statsDto.group_id;
    }

    if (statsDto.subject_id) {
      whereClause.subject_id = statsDto.subject_id;
    }

    if (statsDto.faculty_id) {
      whereClause["$student.group.department.faculty_id$"] =
        statsDto.faculty_id;
    }

    if (statsDto.department_id) {
      whereClause["$student.group.department_id$"] = statsDto.department_id;
    }

    if (statsDto.academic_year) {
      whereClause["$student.academic_year$"] = statsDto.academic_year;
    }

    if (statsDto.semester) {
      whereClause["$subject.semester_number$"] = statsDto.semester;
    }

    const failedSubjects = await this.failedSubjectModel.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          attributes: ["id"],
          include: [
            {
              model: Group,
              attributes: ["id", "name"],
              include: [
                {
                  model: Department,
                  attributes: ["id", "name"],
                  include: [
                    {
                      model: Faculty,
                      attributes: ["id", "name"],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Subject,
          attributes: ["id", "name", "semester_number"],
        },
      ],
    });

    return this.calculateFailedSubjectStats(failedSubjects, statsDto);
  }

  async getUrgentRetakes(daysThreshold: number = 7): Promise<any> {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    const urgentRetakes = await this.failedSubjectModel.findAll({
      where: {
        is_resolved: false,
        retake_required: true,
        planned_retake_date: {
          [Op.between]: [today, thresholdDate],
        },
      },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email", "phone"],
          include: [
            {
              model: Group,
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Subject,
          attributes: ["id", "name", "credit"],
        },
      ],
      order: [["planned_retake_date", "ASC"]],
    });

    return {
      threshold_days: daysThreshold,
      total_urgent: urgentRetakes.length,
      retakes: urgentRetakes.map((failedSubject) => ({
        id: failedSubject.id,
        student_name: failedSubject.student.full_name,
        student_group:
          (failedSubject.student as any).infoStudent?.group?.name || "Unknown",
        subject_name: failedSubject.subject.name,
        planned_date: failedSubject.formattedPlannedDate,
        days_until: failedSubject.daysUntilRetake,
        urgency_level: failedSubject.urgencyLevel,
        fail_reason: failedSubject.fail_reason,
      })),
    };
  }

  async getAcademicRiskStudents(
    minFailed: number = 3,
    semester?: number
  ): Promise<any> {
    const whereClause: any = {
      is_resolved: false,
    };

    if (semester) {
      whereClause["$subject.semester_number$"] = semester;
    }

    const atRiskStudents = await this.failedSubjectModel.findAll({
      where: whereClause,
      attributes: ["student_id", [fn("COUNT", col("id")), "failed_count"]],
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email"],
          include: [
            {
              model: Group,
              attributes: ["id", "name", "course_number"],
            },
          ],
        },
      ],
      group: ["student_id", "student.id", "student.group.id"],
      having: literal(`COUNT(*) >= ${minFailed}`),
      order: [[literal("failed_count"), "DESC"]],
    });

    return {
      threshold: minFailed,
      total_at_risk: atRiskStudents.length,
      students: atRiskStudents.map((item: any) => ({
        student_id: item.student_id,
        student_name: item.student.full_name,
        student_group: item.student.group.name,
        course_number: item.student.group.course_number,
        failed_count: parseInt(item.get("failed_count")),
        risk_level: this.calculateRiskLevel(parseInt(item.get("failed_count"))),
      })),
    };
  }

  async getFailedSubjectsTrends(
    period: string = "monthly",
    limit: number = 12
  ): Promise<any> {
    let groupBy: string;
    let dateFormat: string;

    switch (period) {
      case "daily":
        groupBy = "DATE(created_at)";
        dateFormat = "%Y-%m-%d";
        break;
      case "weekly":
        groupBy = "YEARWEEK(created_at)";
        dateFormat = "%x-W%v";
        break;
      case "monthly":
        groupBy = "DATE_FORMAT(created_at, '%Y-%m')";
        dateFormat = "%Y-%m";
        break;
      case "yearly":
        groupBy = "YEAR(created_at)";
        dateFormat = "%Y";
        break;
      default:
        groupBy = "DATE_FORMAT(created_at, '%Y-%m')";
        dateFormat = "%Y-%m";
    }

    const trends = await this.failedSubjectModel.findAll({
      attributes: [
        [literal(`DATE_FORMAT(created_at, '${dateFormat}')`), "period"],
        [fn("COUNT", col("id")), "count"],
      ],
      group: ["period"],
      order: [[literal("period"), "ASC"]],
      limit,
      raw: true,
    });

    const reasonStats = await this.failedSubjectModel.findAll({
      attributes: ["fail_reason", [fn("COUNT", col("id")), "count"]],
      group: ["fail_reason"],
      order: [[literal("count"), "DESC"]],
      raw: true,
    });

    const resolutionStats = await this.failedSubjectModel.findAll({
      attributes: ["is_resolved", [fn("COUNT", col("id")), "count"]],
      group: ["is_resolved"],
      raw: true,
    });

    return {
      period,
      trends: trends.map((item: any) => ({
        period: item.period,
        count: parseInt(item.count),
      })),
      by_reason: reasonStats.map((item: any) => ({
        reason: item.fail_reason,
        count: parseInt(item.count),
      })),
      resolution_status: {
        resolved: parseInt(
          resolutionStats.find((item: any) => item.is_resolved)?.["count"] || 0
        ),
        unresolved: parseInt(
          resolutionStats.find((item: any) => !item.is_resolved)?.["count"] || 0
        ),
      },
    };
  }

  async generateSummaryReport(
    academicYear?: number,
    semester?: number,
    facultyId?: number
  ): Promise<any> {
    const whereClause: any = {};

    if (academicYear) {
      whereClause["$student.academic_year$"] = academicYear;
    }

    if (semester) {
      whereClause["$subject.semester_number$"] = semester;
    }

    if (facultyId) {
      whereClause["$student.group.department.faculty_id$"] = facultyId;
    }

    const failedSubjects = await this.failedSubjectModel.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          attributes: ["id"],
          include: [
            {
              model: Group,
              attributes: ["id", "name"],
              include: [
                {
                  model: Department,
                  attributes: ["id", "name"],
                  include: [
                    {
                      model: Faculty,
                      attributes: ["id", "name"],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Subject,
          attributes: ["id", "name", "semester_number"],
        },
      ],
    });

    const report = {
      filters: {
        academic_year: academicYear,
        semester: semester,
        faculty_id: facultyId,
      },
      summary: {
        total_failed_subjects: failedSubjects.length,
        unique_students: new Set(failedSubjects.map((fs) => fs.student_id))
          .size,
        unique_subjects: new Set(failedSubjects.map((fs) => fs.subject_id))
          .size,
      },
      by_faculty: {} as any,
      by_department: {} as any,
      by_subject: {} as any,
      by_semester: {} as any,
      resolution_status: {
        resolved: 0,
        unresolved: 0,
      },
    };

    failedSubjects.forEach((failedSubject) => {
      // Fakultet bo'yicha
      const facultyName =
        (failedSubject.student as any)?.infoStudent?.faculty?.name || "Unknown";
      if (!report.by_faculty[facultyName]) {
        report.by_faculty[facultyName] = 0;
      }
      report.by_faculty[facultyName]++;

      // Kafedra bo'yicha
      const departmentName =
        (failedSubject.student as any)?.infoStudent?.group?.department?.name ||
        "Unknown";
      if (!report.by_department[departmentName]) {
        report.by_department[departmentName] = 0;
      }
      report.by_department[departmentName]++;

      // Fan bo'yicha
      const subjectName = failedSubject.subject.name;
      if (!report.by_subject[subjectName]) {
        report.by_subject[subjectName] = 0;
      }
      report.by_subject[subjectName]++;

      // Semester bo'yicha
      const semesterNum = failedSubject.subject.semester_number;
      if (semesterNum) {
        if (!report.by_semester[semesterNum]) {
          report.by_semester[semesterNum] = 0;
        }
        report.by_semester[semesterNum]++;
      }

      // Hal qilish holati
      if (failedSubject.is_resolved) {
        report.resolution_status.resolved++;
      } else {
        report.resolution_status.unresolved++;
      }
    });

    return report;
  }

  // ========== UTILITY METHODS ==========

  private async validateRelatedEntities(
    studentId: number,
    subjectId: number,
    examAttemptId: number
  ): Promise<void> {
    const [student, subject, examAttempt] = await Promise.all([
      this.studentModel.findByPk(studentId),
      this.subjectModel.findByPk(subjectId),
      this.examAttemptModel.findByPk(examAttemptId),
    ]);

    if (!student) throw new NotFoundException("Student not found");
    if (!subject) throw new NotFoundException("Subject not found");
    if (!examAttempt) throw new NotFoundException("Exam attempt not found");

    // Imtihon urinishi talaba va fanga tegishli ekanligini tekshirish
    if (examAttempt.student_id !== studentId) {
      throw new BadRequestException(
        "Exam attempt does not belong to the specified student"
      );
    }

    if (examAttempt.exam.subject_id !== subjectId) {
      throw new BadRequestException(
        "Exam attempt does not belong to the specified subject"
      );
    }
  }

  private calculateFailedSubjectStats(
    failedSubjects: FailedSubject[],
    statsDto: FailedSubjectStatsDto
  ): any {
    const totalFailed = failedSubjects.length;

    const stats = {
      total_failed: totalFailed,
      resolution_rate: 0,
      average_failed_score: 0,
      by_reason: {
        LOW_SCORE: 0,
        DID_NOT_ATTEND: 0,
        PLAGIARISM: 0,
        ACADEMIC_DEBT: 0,
        ADMIN_ISSUE: 0,
        EXCEEDED_ATTEMPTS: 0,
      },
      by_retake_status: {
        required: 0,
        not_required: 0,
      },
      by_semester: {} as any,
      top_failed_subjects: [] as any[],
    };

    if (totalFailed > 0) {
      let totalScore = 0;
      let resolvedCount = 0;
      let scoreCount = 0;
      const subjectCounts: any = {};

      failedSubjects.forEach((failedSubject) => {
        // Sabab bo'yicha
        stats.by_reason[failedSubject.fail_reason]++;

        // Qayta topshirish holati bo'yicha
        if (failedSubject.retake_required) {
          stats.by_retake_status.required++;
        } else {
          stats.by_retake_status.not_required++;
        }

        // Hal qilish holati
        if (failedSubject.is_resolved) {
          resolvedCount++;
        }

        // O'rtacha ball
        if (failedSubject.failed_score) {
          totalScore += failedSubject.failed_score;
          scoreCount++;
        }

        // Semester bo'yicha
        const semester =
          failedSubject.retake_semester ||
          failedSubject.subject?.semester_number;
        if (semester) {
          if (!stats.by_semester[semester]) {
            stats.by_semester[semester] = 0;
          }
          stats.by_semester[semester]++;
        }

        // Fanlar bo'yicha
        const subjectName = failedSubject.subject.name;
        if (!subjectCounts[subjectName]) {
          subjectCounts[subjectName] = 0;
        }
        subjectCounts[subjectName]++;
      });

      stats.resolution_rate = Math.round((resolvedCount / totalFailed) * 100);
      stats.average_failed_score =
        scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

      // Eng ko'p muvaffaqiyatsiz bo'lgan fanlar
      stats.top_failed_subjects = Object.entries(subjectCounts)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }

    return {
      period: {
        start_date: statsDto.start_date,
        end_date: statsDto.end_date,
      },
      filters: {
        student_id: statsDto.student_id,
        group_id: statsDto.group_id,
        subject_id: statsDto.subject_id,
        faculty_id: statsDto.faculty_id,
        department_id: statsDto.department_id,
        academic_year: statsDto.academic_year,
        semester: statsDto.semester,
      },
      statistics: stats,
    };
  }

  private calculateRiskLevel(failedCount: number): string {
    if (failedCount >= 5) return "CRITICAL";
    if (failedCount >= 3) return "HIGH";
    if (failedCount >= 2) return "MEDIUM";
    return "LOW";
  }
}
