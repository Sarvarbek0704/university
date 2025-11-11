import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { StudentCredit } from "./models/student_credit.model";
import { Student } from "../students/models/student.model";
import { ExamResult } from "../exam_results/models/exam_result.model";
import { Subject } from "../subjects/models/subject.model";
import { CreateStudentCreditDto } from "./dto/create-student_credit.dto";
import { UpdateStudentCreditDto } from "./dto/update-student_credit.dto";
import { Exam } from "../exams/models/exam.model";

@Injectable()
export class StudentCreditsService {
  constructor(
    @InjectModel(StudentCredit)
    private readonly studentCreditModel: typeof StudentCredit,
    @InjectModel(Student)
    private readonly studentModel: typeof Student,
    @InjectModel(ExamResult)
    private readonly examResultModel: typeof ExamResult,
    @InjectModel(Subject)
    private readonly subjectModel: typeof Subject
  ) {}

  async create(
    createStudentCreditDto: CreateStudentCreditDto
  ): Promise<StudentCredit> {
    const student = await this.studentModel.findByPk(
      createStudentCreditDto.student_id
    );
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    const existingRecord = await this.studentCreditModel.findOne({
      where: {
        student_id: createStudentCreditDto.student_id,
        semester_id: createStudentCreditDto.semester_id,
      },
    });

    if (existingRecord) {
      throw new ConflictException(
        "Student credit record for this semester already exists"
      );
    }

    return this.studentCreditModel.create(createStudentCreditDto);
  }

  async findAll(): Promise<StudentCredit[]> {
    return this.studentCreditModel.findAll({
      include: [Student],
      order: [
        ["student_id", "ASC"],
        ["semester_id", "ASC"],
      ],
    });
  }

  async findOne(id: number): Promise<StudentCredit> {
    const studentCredit = await this.studentCreditModel.findByPk(id, {
      include: [Student],
    });

    if (!studentCredit) {
      throw new NotFoundException(`Student credit with ID ${id} not found`);
    }

    return studentCredit;
  }

  async findByStudent(studentId: number): Promise<StudentCredit[]> {
    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return this.studentCreditModel.findAll({
      where: { student_id: studentId },
      order: [["semester_id", "ASC"]],
    });
  }

  async update(
    id: number,
    updateStudentCreditDto: UpdateStudentCreditDto
  ): Promise<StudentCredit> {
    const studentCredit = await this.findOne(id);
    await studentCredit.update(updateStudentCreditDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const studentCredit = await this.findOne(id);
    await studentCredit.destroy();
    return { message: "Student credit record deleted successfully" };
  }

  async getStudentSummary(studentId: number): Promise<any> {
    const student = await this.studentModel.findByPk(studentId, {
      include: [
        {
          model: StudentCredit,
          order: [["semester_id", "ASC"]],
        },
      ],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const credits = student.student_credits || [];

    const totalCredits = credits.reduce(
      (sum, credit) => sum + credit.total_credits,
      0
    );
    const completedSemesters = credits.filter((c) => c.isCompleted).length;
    const averageGPA =
      credits.length > 0
        ? credits.reduce(
            (sum, credit) => sum + parseFloat(credit.gpa.toString()),
            0
          ) / credits.length
        : 0;

    return {
      student: {
        id: student.id,
        full_name: student.full_name,
      },
      summary: {
        total_semesters: credits.length,
        completed_semesters: completedSemesters,
        total_credits: totalCredits,
        average_gpa: Math.round(averageGPA * 100) / 100,
        current_status:
          credits.length > 0
            ? credits[credits.length - 1].status
            : "NO_RECORDS",
      },
      semester_details: credits.map((credit) => ({
        semester_id: credit.semester_id,
        credits: credit.total_credits,
        gpa: credit.gpa,
        status: credit.status,
        gpa_letter: credit.gpaLetter,
      })),
    };
  }

  async calculateStudentCredits(studentId: number): Promise<any> {
    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Talabaning barcha imtihon natijalarini olish
    const examResults = await this.examResultModel.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: Exam,
          attributes: ["id"],
          include: [
            {
              model: Subject,
              attributes: ["id", "name", "credit", "semester_number"],
            },
          ],
        },
      ],
    });

    // Semester bo'yicha guruhlash
    const semesterData: {
      [semester: number]: { credits: number; points: number; count: number };
    } = {};

    examResults.forEach((result) => {
      if (result.exam && result.exam.subject) {
        const semester = result.exam.subject.semester_number;
        const credit = result.exam.subject.credit || 0;
        const gradePoints = this.calculateGradePoints(result.score);

        if (!semesterData[semester]) {
          semesterData[semester] = { credits: 0, points: 0, count: 0 };
        }

        semesterData[semester].credits += credit;
        semesterData[semester].points += gradePoints * credit;
        semesterData[semester].count++;
      }
    });

    // Har bir semester uchun credit record ni yaratish yoki yangilash
    const results = [];
    for (const [semester, data] of Object.entries(semesterData)) {
      const semesterNum = parseInt(semester);
      const gpa = data.credits > 0 ? data.points / data.credits : 0;

      const [studentCredit, created] = await this.studentCreditModel.upsert({
        student_id: studentId,
        semester_id: semesterNum,
        total_credits: data.credits,
        gpa: Math.round(gpa * 100) / 100,
        status: gpa >= 2.0 ? "COMPLETED" : "FAILED",
      });

      results.push({
        semester: semesterNum,
        credits: data.credits,
        gpa: Math.round(gpa * 100) / 100,
        status: created ? "CREATED" : "UPDATED",
      });
    }

    return {
      student: {
        id: student.id,
        full_name: student.full_name,
      },
      calculated_semesters: results,
      total_semesters_calculated: results.length,
    };
  }

  private calculateGradePoints(score: number): number {
    if (score >= 90) return 4.0;
    if (score >= 85) return 3.7;
    if (score >= 80) return 3.3;
    if (score >= 75) return 3.0;
    if (score >= 70) return 2.7;
    if (score >= 65) return 2.3;
    if (score >= 60) return 2.0;
    if (score >= 55) return 1.7;
    if (score >= 50) return 1.3;
    return 0.0;
  }
}
