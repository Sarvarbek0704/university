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
import { FilterExamAttemptDto } from "./dto/filter-exam-attempt.dto";
import { ExamAttemptStatsDto } from "./dto/exam-attempt-stats.dto";
import { RetakeRequestDto } from "./dto/retake-request.dto";
import { Teacher } from "../teachers/models/teacher.model";
import { ExamAttempt } from "./models/exam_attempt.model";
import { CreateExamAttemptDto } from "./dto/create-exam_attempt.dto";
import { UpdateExamAttemptDto } from "./dto/update-exam_attempt.dto";

@Injectable()
export class ExamAttemptsService {
  constructor(
    @InjectModel(ExamAttempt)
    private readonly examAttemptModel: typeof ExamAttempt,
    @InjectModel(Exam)
    private readonly examModel: typeof Exam,
    @InjectModel(Student)
    private readonly studentModel: typeof Student,
    @InjectModel(Subject)
    private readonly subjectModel: typeof Subject,
    @InjectModel(Group)
    private readonly groupModel: typeof Group
  ) {}

  async create(
    createExamAttemptDto: CreateExamAttemptDto
  ): Promise<ExamAttempt> {
    // Imtihon va talaba mavjudligini tekshirish
    await this.validateExamAndStudent(
      createExamAttemptDto.exam_id,
      createExamAttemptDto.student_id
    );

    // Bir xil imtihon, talaba va urinish raqami uchun urinish mavjudligini tekshirish
    const existingAttempt = await this.examAttemptModel.findOne({
      where: {
        exam_id: createExamAttemptDto.exam_id,
        student_id: createExamAttemptDto.student_id,
        attempt_number: createExamAttemptDto.attempt_number,
      },
    });

    if (existingAttempt) {
      throw new ConflictException(
        "Exam attempt for this student, exam and attempt number already exists"
      );
    }

    // Maksimal urinishlar sonini tekshirish
    const maxAttempts = await this.getMaxAttemptNumber(
      createExamAttemptDto.exam_id,
      createExamAttemptDto.student_id
    );

    if (createExamAttemptDto.attempt_number > maxAttempts + 1) {
      throw new BadRequestException(
        `Invalid attempt number. Next available attempt number is ${maxAttempts + 1}`
      );
    }

    const examAttempt = await this.examAttemptModel.create({
      exam_id: createExamAttemptDto.exam_id,
      student_id: createExamAttemptDto.student_id,
      attempt_number: createExamAttemptDto.attempt_number,
      score: createExamAttemptDto.score,
      attempt_date: createExamAttemptDto.attempt_date,
      status: createExamAttemptDto.status,
      retake_fee: createExamAttemptDto.retake_fee || 0,
      remarks: createExamAttemptDto.remarks,
      start_time: createExamAttemptDto.start_time,
      end_time: createExamAttemptDto.end_time,
      notes: createExamAttemptDto.notes,
      is_fee_paid: createExamAttemptDto.retake_fee ? false : true,
    } as any);

    return this.findOne(examAttempt.id);
  }

  async requestRetake(
    retakeRequestDto: RetakeRequestDto
  ): Promise<ExamAttempt> {
    // Imtihon va talaba mavjudligini tekshirish
    await this.validateExamAndStudent(
      retakeRequestDto.exam_id,
      retakeRequestDto.student_id
    );

    // Oldingi urinishlarni olish
    const previousAttempts = await this.examAttemptModel.findAll({
      where: {
        exam_id: retakeRequestDto.exam_id,
        student_id: retakeRequestDto.student_id,
      },
      order: [["attempt_number", "ASC"]],
    });

    if (previousAttempts.length === 0) {
      throw new BadRequestException("No previous exam attempts found");
    }

    const lastAttempt = previousAttempts[previousAttempts.length - 1];

    // Maksimal urinishlar sonini tekshirish
    if (lastAttempt.isFinalAttempt) {
      throw new BadRequestException("Maximum number of attempts reached");
    }

    // Keyingi urinish raqamini aniqlash
    const nextAttemptNumber = lastAttempt.attempt_number + 1;
    const nextStatus = this.getNextAttemptStatus(nextAttemptNumber);

    // Retake fee ni hisoblash
    const retakeFee = this.calculateRetakeFee(nextAttemptNumber);

    const examAttempt = await this.examAttemptModel.create({
      exam_id: retakeRequestDto.exam_id,
      student_id: retakeRequestDto.student_id,
      attempt_number: nextAttemptNumber,
      score: 0, // Boshlang'ich qiymat
      attempt_date: new Date(), // Hozirgi sana
      status: nextStatus,
      retake_fee: retakeFee,
      remarks: `Retake request: ${retakeRequestDto.reason}. ${retakeRequestDto.explanation || ""}`,
      is_fee_paid: false,
    } as any);

    return this.findOne(examAttempt.id);
  }

  async findAll(filterDto: FilterExamAttemptDto): Promise<ExamAttempt[]> {
    const whereClause: any = {};

    if (filterDto.exam_id) {
      whereClause.exam_id = filterDto.exam_id;
    }

    if (filterDto.student_id) {
      whereClause.student_id = filterDto.student_id;
    }

    if (filterDto.attempt_number) {
      whereClause.attempt_number = filterDto.attempt_number;
    }

    if (filterDto.status) {
      whereClause.status = filterDto.status;
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

    if (filterDto.date_from && filterDto.date_to) {
      whereClause.attempt_date = {
        [Op.between]: [filterDto.date_from, filterDto.date_to],
      };
    }

    if (filterDto.has_paid_fee !== undefined) {
      whereClause.is_fee_paid = filterDto.has_paid_fee;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.examAttemptModel.findAll({
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
      order: [
        [filterDto.sort_by || "attempt_date", filterDto.sort_order || "DESC"],
      ],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<ExamAttempt> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid exam attempt ID");
    }

    const examAttempt = await this.examAttemptModel.findByPk(id, {
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

    if (!examAttempt) {
      throw new NotFoundException(`Exam attempt with ID ${id} not found`);
    }

    return examAttempt;
  }

  async findByStudent(studentId: number): Promise<ExamAttempt[]> {
    if (!studentId || isNaN(studentId)) {
      throw new BadRequestException("Invalid student ID");
    }

    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return this.examAttemptModel.findAll({
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
      order: [
        [{ model: Exam, as: "exam" }, "exam_date", "DESC"],
        ["attempt_number", "ASC"],
      ],
    });
  }

  async findByExam(examId: number): Promise<ExamAttempt[]> {
    if (!examId || isNaN(examId)) {
      throw new BadRequestException("Invalid exam ID");
    }

    const exam = await this.examModel.findByPk(examId);
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${examId} not found`);
    }

    return this.examAttemptModel.findAll({
      where: {
        exam_id: examId,
      },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email"],
        },
      ],
      order: [
        ["attempt_number", "ASC"],
        ["score", "DESC"],
      ],
    });
  }

  async getStudentExamAttempts(
    studentId: number,
    examId: number
  ): Promise<ExamAttempt[]> {
    const [student, exam] = await Promise.all([
      this.studentModel.findByPk(studentId),
      this.examModel.findByPk(examId),
    ]);

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }
    if (!exam) {
      throw new NotFoundException(`Exam with ID ${examId} not found`);
    }

    return this.examAttemptModel.findAll({
      where: {
        student_id: studentId,
        exam_id: examId,
      },
      include: [
        {
          model: Exam,
          include: [
            {
              model: Subject,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["attempt_number", "ASC"]],
    });
  }

  async update(
    id: number,
    updateExamAttemptDto: UpdateExamAttemptDto
  ): Promise<ExamAttempt> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid exam attempt ID");
    }

    const examAttempt = await this.findOne(id);

    // Urinish raqamini yangilashda tekshirish
    if (updateExamAttemptDto.attempt_number !== undefined) {
      const maxAttempts = await this.getMaxAttemptNumber(
        examAttempt.exam_id,
        examAttempt.student_id
      );

      if (updateExamAttemptDto.attempt_number > maxAttempts + 1) {
        throw new BadRequestException(
          `Invalid attempt number. Maximum allowed is ${maxAttempts + 1}`
        );
      }
    }

    await examAttempt.update(updateExamAttemptDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid exam attempt ID");
    }

    const examAttempt = await this.findOne(id);
    await examAttempt.destroy();

    return { message: "Exam attempt deleted successfully" };
  }

  async payRetakeFee(id: number): Promise<ExamAttempt> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid exam attempt ID");
    }

    const examAttempt = await this.findOne(id);

    if (examAttempt.retake_fee <= 0) {
      throw new BadRequestException("No retake fee required for this attempt");
    }

    if (examAttempt.is_fee_paid) {
      throw new BadRequestException("Retake fee already paid");
    }

    await examAttempt.update({ is_fee_paid: true });
    return this.findOne(id);
  }

  async approveRetake(id: number): Promise<ExamAttempt> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid exam attempt ID");
    }

    const examAttempt = await this.findOne(id);

    if (!examAttempt.isRetake) {
      throw new BadRequestException("Only retake attempts can be approved");
    }

    if (examAttempt.retake_fee > 0 && !examAttempt.is_fee_paid) {
      throw new BadRequestException("Retake fee must be paid before approval");
    }

    // Urinishni tasdiqlangan deb belgilash
    await examAttempt.update({
      remarks: examAttempt.remarks
        ? `${examAttempt.remarks} - Approved on ${new Date().toLocaleDateString()}`
        : `Approved on ${new Date().toLocaleDateString()}`,
    });

    return this.findOne(id);
  }

  // ========== STATISTICS METHODS ==========

  async getExamAttemptStats(statsDto: ExamAttemptStatsDto): Promise<any> {
    const whereClause: any = {
      attempt_date: {
        [Op.between]: [statsDto.start_date, statsDto.end_date],
      },
    };

    if (statsDto.student_id) {
      whereClause.student_id = statsDto.student_id;
    }

    if (statsDto.exam_id) {
      whereClause.exam_id = statsDto.exam_id;
    }

    if (statsDto.subject_id) {
      whereClause["$exam.subject_id$"] = statsDto.subject_id;
    }

    if (statsDto.group_id) {
      whereClause["$exam.group_id$"] = statsDto.group_id;
    }

    const examAttempts = await this.examAttemptModel.findAll({
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

    return this.calculateAttemptStats(examAttempts, statsDto);
  }

  async getExamRetakes(examId: number): Promise<any> {
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

    const retakeAttempts = await this.examAttemptModel.findAll({
      where: {
        exam_id: examId,
        status: {
          [Op.in]: ["RETAKE_1", "RETAKE_2", "FINAL_RETAKE"],
        },
      },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email"],
        },
      ],
      order: [["attempt_number", "ASC"]],
    });

    const retakeStats = {
      total_retakes: retakeAttempts.length,
      by_type: {
        RETAKE_1: 0,
        RETAKE_2: 0,
        FINAL_RETAKE: 0,
      },
      average_improvement: 0,
    };

    let totalImprovement = 0;
    let improvementCount = 0;

    retakeAttempts.forEach((attempt) => {
      retakeStats.by_type[attempt.status]++;

      // Takroriy urinishlardagi o'sishni hisoblash
      if (attempt.attempt_number > 1) {
        // TODO: Oldingi urinish ballini olish va o'sishni hisoblash
        improvementCount++;
      }
    });

    if (improvementCount > 0) {
      retakeStats.average_improvement = Math.round(
        totalImprovement / improvementCount
      );
    }

    return {
      exam: {
        id: exam.id,
        subject: exam.subject.name,
        group: exam.group.name,
        type: exam.exam_type,
      },
      retake_statistics: retakeStats,
      retake_attempts: retakeAttempts.map((attempt) => ({
        id: attempt.id,
        student_name: attempt.student.full_name,
        attempt_number: attempt.attempt_number,
        status: attempt.status,
        score: attempt.score,
        attempt_date: attempt.attempt_date,
        is_fee_paid: attempt.is_fee_paid,
      })),
    };
  }

  async getPendingRetakes(): Promise<ExamAttempt[]> {
    return this.examAttemptModel.findAll({
      where: {
        status: {
          [Op.in]: ["RETAKE_1", "RETAKE_2", "FINAL_RETAKE"],
        },
        is_fee_paid: false,
        score: 0, // Hali ball kiritilmagan
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
        {
          model: Student,
          attributes: ["id", "full_name", "email"],
        },
      ],
      order: [["attempt_date", "ASC"]],
    });
  }

  async getStudentImprovement(studentId: number): Promise<any> {
    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const allAttempts = await this.findByStudent(studentId);

    // Har bir imtihon bo'yicha o'sishni hisoblash
    const improvementByExam: any = {};

    allAttempts.forEach((attempt) => {
      const examId = attempt.exam_id;

      if (!improvementByExam[examId]) {
        improvementByExam[examId] = {
          exam_id: examId,
          subject_name: attempt.exam.subject.name,
          attempts: [],
          improvement: 0,
          best_score: 0,
        };
      }

      improvementByExam[examId].attempts.push({
        attempt_number: attempt.attempt_number,
        score: attempt.score,
        status: attempt.status,
        date: attempt.attempt_date,
      });

      // Eng yaxshi ballni yangilash
      if (attempt.score > improvementByExam[examId].best_score) {
        improvementByExam[examId].best_score = attempt.score;
      }
    });

    // O'sishni hisoblash
    Object.keys(improvementByExam).forEach((examId) => {
      const examData = improvementByExam[examId];
      if (examData.attempts.length > 1) {
        const firstScore = examData.attempts[0].score;
        const lastScore = examData.attempts[examData.attempts.length - 1].score;
        examData.improvement = lastScore - firstScore;
      }
    });

    const overallImprovement =
      Object.values(improvementByExam).reduce(
        (total: number, exam: any) => total + exam.improvement,
        0
      ) / Object.keys(improvementByExam).length;

    return {
      student: {
        id: student.id,
        full_name: student.full_name,
      },
      overall_improvement: Math.round(overallImprovement * 100) / 100,
      improvement_by_exam: Object.values(improvementByExam),
      total_exams_with_retakes: Object.keys(improvementByExam).length,
    };
  }

  async getFailedExams(studentId: number): Promise<any> {
    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const allAttempts = await this.findByStudent(studentId);

    // Har bir imtihonning oxirgi urinishini olish
    const lastAttemptsByExam: any = {};

    allAttempts.forEach((attempt) => {
      const examId = attempt.exam_id;

      if (
        !lastAttemptsByExam[examId] ||
        attempt.attempt_number > lastAttemptsByExam[examId].attempt_number
      ) {
        lastAttemptsByExam[examId] = attempt;
      }
    });

    // Muvaffaqiyatsiz imtihonlarni filtrlash
    const failedExams = Object.values(lastAttemptsByExam).filter(
      (attempt: any) => !attempt.isPassed && !attempt.isFinalAttempt
    );

    return {
      student: {
        id: student.id,
        full_name: student.full_name,
      },
      failed_exams: failedExams.map((attempt: any) => ({
        exam_id: attempt.exam_id,
        subject_name: attempt.exam.subject.name,
        attempt_number: attempt.attempt_number,
        score: attempt.score,
        status: attempt.status,
        can_retake: !attempt.isFinalAttempt,
        next_attempt_number: attempt.attempt_number + 1,
        estimated_fee: this.calculateRetakeFee(attempt.attempt_number + 1),
      })),
      total_failed: failedExams.length,
    };
  }

  async getRetakeRatesAnalytics(
    subjectId?: number,
    groupId?: number,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const whereClause: any = {};

    if (subjectId) {
      whereClause["$exam.subject_id$"] = subjectId;
    }

    if (groupId) {
      whereClause["$exam.group_id$"] = groupId;
    }

    if (startDate && endDate) {
      whereClause.attempt_date = {
        [Op.between]: [startDate, endDate],
      };
    }

    const examAttempts = await this.examAttemptModel.findAll({
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
      ],
    });

    const analytics = {
      total_attempts: examAttempts.length,
      retake_attempts: 0,
      retake_rate: 0,
      by_subject: {} as any,
      by_group: {} as any,
      by_month: {} as any,
    };

    examAttempts.forEach((attempt) => {
      // Takroriy urinishlar soni
      if (attempt.isRetake) {
        analytics.retake_attempts++;
      }

      // Fan bo'yicha
      const subjectName = attempt.exam.subject.name;
      if (!analytics.by_subject[subjectName]) {
        analytics.by_subject[subjectName] = { total: 0, retakes: 0 };
      }
      analytics.by_subject[subjectName].total++;
      if (attempt.isRetake) {
        analytics.by_subject[subjectName].retakes++;
      }

      // Guruh bo'yicha
      const groupName = attempt.exam.group.name;
      if (!analytics.by_group[groupName]) {
        analytics.by_group[groupName] = { total: 0, retakes: 0 };
      }
      analytics.by_group[groupName].total++;
      if (attempt.isRetake) {
        analytics.by_group[groupName].retakes++;
      }

      // Oy bo'yicha
      const monthKey = attempt.attempt_date.toISOString().slice(0, 7);
      if (!analytics.by_month[monthKey]) {
        analytics.by_month[monthKey] = { total: 0, retakes: 0 };
      }
      analytics.by_month[monthKey].total++;
      if (attempt.isRetake) {
        analytics.by_month[monthKey].retakes++;
      }
    });

    // Foizlarni hisoblash
    if (analytics.total_attempts > 0) {
      analytics.retake_rate = Math.round(
        (analytics.retake_attempts / analytics.total_attempts) * 100
      );
    }

    // Fanlar bo'yicha foizlarni hisoblash
    Object.keys(analytics.by_subject).forEach((subject) => {
      const subjectData = analytics.by_subject[subject];
      subjectData.retake_rate =
        subjectData.total > 0
          ? Math.round((subjectData.retakes / subjectData.total) * 100)
          : 0;
    });

    return analytics;
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

  private async getMaxAttemptNumber(
    examId: number,
    studentId: number
  ): Promise<number> {
    const lastAttempt = await this.examAttemptModel.findOne({
      where: {
        exam_id: examId,
        student_id: studentId,
      },
      order: [["attempt_number", "DESC"]],
    });

    return lastAttempt ? lastAttempt.attempt_number : 0;
  }

  private getNextAttemptStatus(attemptNumber: number): string {
    switch (attemptNumber) {
      case 1:
        return "FIRST_ATTEMPT";
      case 2:
        return "RETAKE_1";
      case 3:
        return "RETAKE_2";
      case 4:
        return "FINAL_RETAKE";
      default:
        return "FINAL_RETAKE";
    }
  }

  private calculateRetakeFee(attemptNumber: number): number {
    switch (attemptNumber) {
      case 2:
        return 25.0;
      case 3:
        return 35.0;
      case 4:
        return 50.0;
      default:
        return 0;
    }
  }

  private calculateAttemptStats(
    examAttempts: ExamAttempt[],
    statsDto: ExamAttemptStatsDto
  ): any {
    const totalAttempts = examAttempts.length;
    const passingScore = statsDto.passing_score || 60;

    const stats = {
      total_attempts: totalAttempts,
      average_score: 0,
      pass_rate: 0,
      first_attempt_pass_rate: 0,
      retake_success_rate: 0,
      attempt_distribution: {
        FIRST_ATTEMPT: 0,
        RETAKE_1: 0,
        RETAKE_2: 0,
        FINAL_RETAKE: 0,
        TRANSFER_GRADE: 0,
        NOT_ATTENDED: 0,
      },
      score_ranges: {
        "90-100": 0,
        "80-89": 0,
        "70-79": 0,
        "60-69": 0,
        "50-59": 0,
        "0-49": 0,
      },
    };

    if (totalAttempts > 0) {
      let totalScore = 0;
      let passedAttempts = 0;
      let firstAttemptPassed = 0;
      let retakePassed = 0;
      let retakeAttempts = 0;

      examAttempts.forEach((attempt) => {
        totalScore += attempt.score;

        if (attempt.isPassed) {
          passedAttempts++;
        }

        if (attempt.isFirstAttempt && attempt.isPassed) {
          firstAttemptPassed++;
        }

        if (attempt.isRetake) {
          retakeAttempts++;
          if (attempt.isPassed) {
            retakePassed++;
          }
        }

        // Urinishlar taqsimoti
        stats.attempt_distribution[attempt.status]++;

        // Ballar oralig'i
        if (attempt.score >= 90) stats.score_ranges["90-100"]++;
        else if (attempt.score >= 80) stats.score_ranges["80-89"]++;
        else if (attempt.score >= 70) stats.score_ranges["70-79"]++;
        else if (attempt.score >= 60) stats.score_ranges["60-69"]++;
        else if (attempt.score >= 50) stats.score_ranges["50-59"]++;
        else stats.score_ranges["0-49"]++;
      });

      stats.average_score = Math.round(totalScore / totalAttempts);
      stats.pass_rate = Math.round((passedAttempts / totalAttempts) * 100);

      const firstAttempts = stats.attempt_distribution.FIRST_ATTEMPT;
      if (firstAttempts > 0) {
        stats.first_attempt_pass_rate = Math.round(
          (firstAttemptPassed / firstAttempts) * 100
        );
      }

      if (retakeAttempts > 0) {
        stats.retake_success_rate = Math.round(
          (retakePassed / retakeAttempts) * 100
        );
      }
    }

    return {
      period: {
        start_date: statsDto.start_date,
        end_date: statsDto.end_date,
      },
      filters: {
        student_id: statsDto.student_id,
        exam_id: statsDto.exam_id,
        subject_id: statsDto.subject_id,
        group_id: statsDto.group_id,
        passing_score: passingScore,
      },
      statistics: stats,
    };
  }
}
