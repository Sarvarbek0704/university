import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, fn, col, literal } from "sequelize";
import { Exam } from "../exams/models/exam.model";
import { Student } from "../students/models/student.model";
import { Subject } from "../subjects/models/subject.model";
import { Group } from "../groups/models/group.model";
import { ExamResultStatsDto } from "./dto/exam-result-stats.dto";
import { ExamResult } from "./models/exam_result.model";
import { CreateExamResultDto } from "./dto/create-exam_result.dto";
import { Teacher } from "../teachers/models/teacher.model";
import { UpdateExamResultDto } from "./dto/update-exam_result.dto";
import { FilterExamResultDto } from "./dto/filter-exam-result.dto";

@Injectable()
export class ExamResultsService {
  constructor(
    @InjectModel(ExamResult)
    private readonly examResultModel: typeof ExamResult,
    @InjectModel(Exam)
    private readonly examModel: typeof Exam,
    @InjectModel(Student)
    private readonly studentModel: typeof Student,
    @InjectModel(Subject)
    private readonly subjectModel: typeof Subject,
    @InjectModel(Group)
    private readonly groupModel: typeof Group
  ) {}

  async create(createExamResultDto: CreateExamResultDto): Promise<ExamResult> {
    // Imtihon va talaba mavjudligini tekshirish
    await this.validateExamAndStudent(
      createExamResultDto.exam_id,
      createExamResultDto.student_id
    );

    // Bir xil imtihon va talaba uchun natija mavjudligini tekshirish
    const existingResult = await this.examResultModel.findOne({
      where: {
        exam_id: createExamResultDto.exam_id,
        student_id: createExamResultDto.student_id,
      },
    });

    if (existingResult) {
      throw new ConflictException(
        "Exam result for this student and exam already exists"
      );
    }

    // Grade ni avtomatik hisoblash
    const grade = ExamResult.calculateGrade(createExamResultDto.score);

    const examResult = await this.examResultModel.create({
      exam_id: createExamResultDto.exam_id,
      student_id: createExamResultDto.student_id,
      score: createExamResultDto.score,
      grade: grade,
      notes: createExamResultDto.notes,
      is_published: createExamResultDto.is_published ?? false,
    } as any);

    return this.findOne(examResult.id);
  }

  async createBulk(bulkResults: CreateExamResultDto[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const resultDto of bulkResults) {
      try {
        await this.create(resultDto);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Student ${resultDto.student_id}: ${error.message}`
        );
      }
    }

    return results;
  }

  async findAll(filterDto: FilterExamResultDto): Promise<ExamResult[]> {
    const whereClause: any = {};

    if (filterDto.exam_id) {
      whereClause.exam_id = filterDto.exam_id;
    }

    if (filterDto.student_id) {
      whereClause.student_id = filterDto.student_id;
    }

    if (filterDto.grade) {
      whereClause.grade = filterDto.grade;
    }

    if (filterDto.min_score !== undefined) {
      whereClause.score = {
        ...whereClause.score,
        [Op.gte]: filterDto.min_score,
      };
    }

    if (filterDto.max_score !== undefined) {
      whereClause.score = {
        ...whereClause.score,
        [Op.lte]: filterDto.max_score,
      };
    }

    if (filterDto.is_published !== undefined) {
      whereClause.is_published = filterDto.is_published;
    }

    if (filterDto.group_id || filterDto.subject_id) {
      whereClause["$exam.group_id$"] = filterDto.group_id;
      whereClause["$exam.subject_id$"] = filterDto.subject_id;
    }

    if (filterDto.date_from && filterDto.date_to) {
      whereClause["$exam.exam_date$"] = {
        [Op.between]: [filterDto.date_from, filterDto.date_to],
      };
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.examResultModel.findAll({
      where: whereClause,
      include: [
        {
          model: Exam,
          include: [
            {
              model: Subject,
              attributes: ["id", "name", "credit"],
            },
            {
              model: Group,
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Student,
          attributes: ["id", "full_name", "email"],
        },
      ],
      order: [[filterDto.sort_by || "score", filterDto.sort_order || "DESC"]],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<ExamResult> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid exam result ID");
    }

    const examResult = await this.examResultModel.findByPk(id, {
      include: [
        {
          model: Exam,
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
              attributes: ["id", "full_name"],
            },
          ],
        },
        {
          model: Student,
          attributes: ["id", "full_name", "email", "phone"],
        },
      ],
    });

    if (!examResult) {
      throw new NotFoundException(`Exam result with ID ${id} not found`);
    }

    return examResult;
  }

  async findByStudent(studentId: number): Promise<ExamResult[]> {
    if (!studentId || isNaN(studentId)) {
      throw new BadRequestException("Invalid student ID");
    }

    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return this.examResultModel.findAll({
      where: {
        student_id: studentId,
      },
      include: [
        {
          model: Exam,
          include: [
            {
              model: Subject,
              attributes: ["id", "name", "credit"],
            },
            {
              model: Group,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [[{ model: Exam, as: "exam" }, "exam_date", "DESC"]],
    });
  }

  async findByExam(examId: number): Promise<ExamResult[]> {
    if (!examId || isNaN(examId)) {
      throw new BadRequestException("Invalid exam ID");
    }

    const exam = await this.examModel.findByPk(examId);
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${examId} not found`);
    }

    return this.examResultModel.findAll({
      where: {
        exam_id: examId,
      },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email"],
        },
      ],
      order: [["score", "DESC"]],
    });
  }

  async findByGroup(groupId: number): Promise<ExamResult[]> {
    if (!groupId || isNaN(groupId)) {
      throw new BadRequestException("Invalid group ID");
    }

    const group = await this.groupModel.findByPk(groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    return this.examResultModel.findAll({
      where: {
        "$exam.group_id$": groupId,
      },
      include: [
        {
          model: Exam,
          include: [
            {
              model: Subject,
              attributes: ["id", "name", "credit"],
            },
          ],
        },
        {
          model: Student,
          attributes: ["id", "full_name", "email"],
        },
      ],
      order: [
        [{ model: Exam, as: "exam" }, "exam_date", "DESC"],
        ["score", "DESC"],
      ],
    });
  }

  async update(
    id: number,
    updateExamResultDto: UpdateExamResultDto
  ): Promise<ExamResult> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid exam result ID");
    }

    const examResult = await this.findOne(id);

    // Yangilangan score bo'yicha grade ni hisoblash
    if (updateExamResultDto.score !== undefined) {
      const newGrade = ExamResult.calculateGrade(updateExamResultDto.score);
      updateExamResultDto.grade = newGrade;
    }

    await examResult.update(updateExamResultDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid exam result ID");
    }

    const examResult = await this.findOne(id);
    await examResult.destroy();

    return { message: "Exam result deleted successfully" };
  }

  async publishResult(id: number): Promise<ExamResult> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid exam result ID");
    }

    const examResult = await this.findOne(id);
    await examResult.update({ is_published: true });

    return this.findOne(id);
  }

  async unpublishResult(id: number): Promise<ExamResult> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid exam result ID");
    }

    const examResult = await this.findOne(id);
    await examResult.update({ is_published: false });

    return this.findOne(id);
  }

  // ========== STATISTICS METHODS ==========

  async getExamResultStats(statsDto: ExamResultStatsDto): Promise<any> {
    const whereClause: any = {
      "$exam.exam_date$": {
        [Op.between]: [statsDto.start_date, statsDto.end_date],
      },
    };

    if (statsDto.student_id) {
      whereClause.student_id = statsDto.student_id;
    }

    if (statsDto.group_id) {
      whereClause["$exam.group_id$"] = statsDto.group_id;
    }

    if (statsDto.subject_id) {
      whereClause["$exam.subject_id$"] = statsDto.subject_id;
    }

    if (statsDto.exam_id) {
      whereClause.exam_id = statsDto.exam_id;
    }

    const examResults = await this.examResultModel.findAll({
      where: whereClause,
      include: [
        {
          model: Exam,
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
        },
        {
          model: Student,
          attributes: ["id", "full_name"],
        },
      ],
    });

    return this.calculateStats(examResults, statsDto);
  }

  async getExamStatistics(examId: number): Promise<any> {
    const exam = await this.examModel.findByPk(examId, {
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

    if (!exam) {
      throw new NotFoundException(`Exam with ID ${examId} not found`);
    }

    const examResults = await this.findByExam(examId);

    const stats = {
      total_students: examResults.length,
      average_score: 0,
      highest_score: 0,
      lowest_score: 100,
      pass_rate: 0,
      grade_distribution: {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        E: 0,
        F: 0,
        INCOMPLETE: 0,
      },
    };

    if (examResults.length > 0) {
      let totalScore = 0;
      let passedStudents = 0;

      examResults.forEach((result) => {
        totalScore += result.score;
        stats.highest_score = Math.max(stats.highest_score, result.score);
        stats.lowest_score = Math.min(stats.lowest_score, result.score);

        if (result.isPassed) {
          passedStudents++;
        }

        stats.grade_distribution[result.grade]++;
      });

      stats.average_score = Math.round(totalScore / examResults.length);
      stats.pass_rate = Math.round((passedStudents / examResults.length) * 100);
    }

    return {
      exam: {
        id: exam.id,
        subject: exam.subject.name,
        group: exam.group.name,
        type: exam.exam_type,
        max_score: exam.max_score,
      },
      statistics: stats,
    };
  }

  async calculateStudentGPA(studentId: number): Promise<any> {
    const examResults = await this.findByStudent(studentId);
    const student = await this.studentModel.findByPk(studentId);

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    let totalGradePoints = 0;
    let totalCredits = 0;
    const subjectGPAs: any = {};

    examResults.forEach((result) => {
      if (result.exam && result.exam.subject) {
        const subjectId = result.exam.subject.id;
        const credit = result.exam.subject.credit || 1;

        if (!subjectGPAs[subjectId]) {
          subjectGPAs[subjectId] = {
            subject_name: result.exam.subject.name,
            credit: credit,
            total_grade_points: 0,
            exam_count: 0,
          };
        }

        subjectGPAs[subjectId].total_grade_points += result.gradePoints;
        subjectGPAs[subjectId].exam_count++;

        totalGradePoints += result.gradePoints * credit;
        totalCredits += credit;
      }
    });

    // Har bir fan bo'yicha GPA ni hisoblash
    Object.keys(subjectGPAs).forEach((subjectId) => {
      const subject = subjectGPAs[subjectId];
      subject.gpa =
        subject.exam_count > 0
          ? subject.total_grade_points / subject.exam_count
          : 0;
    });

    const overallGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

    return {
      student: {
        id: student.id,
        full_name: student.full_name,
      },
      overall_gpa: Math.round(overallGPA * 100) / 100,
      total_credits: totalCredits,
      subject_gpas: Object.values(subjectGPAs),
      total_exams: examResults.length,
    };
  }

  async getTopStudentsBySubject(
    subjectId: number,
    limit: number = 10
  ): Promise<any> {
    const subject = await this.subjectModel.findByPk(subjectId);
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    const topResults = await this.examResultModel.findAll({
      where: {
        "$exam.subject_id$": subjectId,
      },
      include: [
        {
          model: Exam,
          attributes: ["id"],
          include: [
            {
              model: Subject,
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Student,
          attributes: ["id", "full_name", "email"],
        },
      ],
      order: [["score", "DESC"]],
      limit,
    });

    return {
      subject: {
        id: subject.id,
        name: subject.name,
      },
      top_students: topResults.map((result, index) => ({
        rank: index + 1,
        student_id: result.student.id,
        student_name: result.student.full_name,
        score: result.score,
        grade: result.grade,
        performance: result.performanceLevel,
      })),
    };
  }

  async getStudentSubjectResults(
    studentId: number,
    subjectId: number
  ): Promise<any> {
    const [student, subject] = await Promise.all([
      this.studentModel.findByPk(studentId),
      this.subjectModel.findByPk(subjectId),
    ]);

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${subjectId} not found`);
    }

    const subjectResults = await this.examResultModel.findAll({
      where: {
        student_id: studentId,
        "$exam.subject_id$": subjectId,
      },
      include: [
        {
          model: Exam,
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
        },
      ],
      order: [[{ model: Exam, as: "exam" }, "exam_date", "ASC"]],
    });

    const averageScore =
      subjectResults.length > 0
        ? subjectResults.reduce((sum, result) => sum + result.score, 0) /
          subjectResults.length
        : 0;

    return {
      student: {
        id: student.id,
        full_name: student.full_name,
      },
      subject: {
        id: subject.id,
        name: subject.name,
        credit: subject.credit,
      },
      results: subjectResults.map((result) => ({
        exam_id: result.exam_id,
        exam_type: result.exam.exam_type,
        exam_date: result.exam.exam_date,
        score: result.score,
        grade: result.grade,
        is_published: result.is_published,
        performance: result.performanceLevel,
      })),
      summary: {
        total_exams: subjectResults.length,
        average_score: Math.round(averageScore * 100) / 100,
        highest_score:
          subjectResults.length > 0
            ? Math.max(...subjectResults.map((r) => r.score))
            : 0,
        lowest_score:
          subjectResults.length > 0
            ? Math.min(...subjectResults.map((r) => r.score))
            : 0,
      },
    };
  }

  // ========== UTILITY METHODS ==========

  private async validateExamAndStudent(
    examId: number,
    studentId: number
  ): Promise<void> {
    const [exam, student] = await Promise.all([
      this.examModel.findByPk(examId),
      this.studentModel.findByPk(studentId),
    ]);

    if (!exam) throw new NotFoundException("Exam not found");
    if (!student) throw new NotFoundException("Student not found");
  }

  private calculateStats(
    examResults: ExamResult[],
    statsDto: ExamResultStatsDto
  ): any {
    const totalResults = examResults.length;
    const passingScore = statsDto.passing_score || 60;

    const stats = {
      total_results: totalResults,
      average_score: 0,
      highest_score: 0,
      lowest_score: 100,
      pass_rate: 0,
      grade_distribution: {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        E: 0,
        F: 0,
        INCOMPLETE: 0,
      },
      performance_breakdown: {
        excellent: 0,
        very_good: 0,
        good: 0,
        satisfactory: 0,
        needs_improvement: 0,
      },
    };

    if (totalResults > 0) {
      let totalScore = 0;
      let passedStudents = 0;

      examResults.forEach((result) => {
        totalScore += result.score;
        stats.highest_score = Math.max(stats.highest_score, result.score);
        stats.lowest_score = Math.min(stats.lowest_score, result.score);

        if (result.score >= passingScore) {
          passedStudents++;
        }

        stats.grade_distribution[result.grade]++;

        // Performance breakdown
        if (result.score >= 90) stats.performance_breakdown.excellent++;
        else if (result.score >= 80) stats.performance_breakdown.very_good++;
        else if (result.score >= 70) stats.performance_breakdown.good++;
        else if (result.score >= 60) stats.performance_breakdown.satisfactory++;
        else stats.performance_breakdown.needs_improvement++;
      });

      stats.average_score = Math.round(totalScore / totalResults);
      stats.pass_rate = Math.round((passedStudents / totalResults) * 100);
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
        exam_id: statsDto.exam_id,
        passing_score: passingScore,
      },
      statistics: stats,
    };
  }
}
