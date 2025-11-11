import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
  AllowNull,
  BeforeUpdate,
  BeforeCreate,
  Index,
} from "sequelize-typescript";
import { Exam } from "../../exams/models/exam.model";
import { Student } from "../../students/models/student.model";

@Table({
  tableName: "exam_results",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["exam_id", "student_id"],
      name: "unique_exam_student",
    },
    {
      fields: ["exam_id"],
    },
    {
      fields: ["student_id"],
    },
    {
      fields: ["grade"],
    },
    {
      fields: ["score"],
    },
    {
      fields: ["is_published"],
    },
  ],
})
export class ExamResult extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Exam)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Exam ID must be a positive number",
      },
    },
  })
  exam_id: number;

  @ForeignKey(() => Student)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Student ID must be a positive number",
      },
    },
  })
  student_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: "Score must be at least 0",
      },
      max: {
        args: [100],
        msg: "Score cannot exceed 100",
      },
    },
  })
  score: number;

  @Column({
    type: DataType.ENUM("A", "B", "C", "D", "E", "F", "INCOMPLETE"),
    allowNull: false,
    validate: {
      isIn: {
        args: [["A", "B", "C", "D", "E", "F", "INCOMPLETE"]],
        msg: "Invalid grade",
      },
    },
  })
  grade: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @Default(false)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_published: boolean;

  @BelongsTo(() => Exam)
  exam: Exam;

  @BelongsTo(() => Student)
  student: Student;

  @BeforeUpdate
  @BeforeCreate
  static validateExamResult(examResult: ExamResult) {
    // Grade ni score asosida avtomatik hisoblash
    if (examResult.score !== undefined && !examResult.grade) {
      examResult.grade = ExamResult.calculateGrade(examResult.score);
    }

    // Score va grade mosligini tekshirish
    if (examResult.score !== undefined && examResult.grade) {
      const calculatedGrade = ExamResult.calculateGrade(examResult.score);
      if (examResult.grade !== calculatedGrade) {
        throw new Error(
          `Grade ${examResult.grade} does not match score ${examResult.score}. Expected grade: ${calculatedGrade}`
        );
      }
    }
  }

  static calculateGrade(score: number): string {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    if (score >= 50) return "E";
    return "F";
  }

  get isPassed(): boolean {
    return this.score >= 60; // 60% for passing
  }

  get gradePoints(): number {
    const gradePointsMap = {
      A: 4.0,
      B: 3.0,
      C: 2.0,
      D: 1.0,
      E: 0.5,
      F: 0.0,
      INCOMPLETE: 0.0,
    };
    return gradePointsMap[this.grade] || 0;
  }

  get performanceLevel(): string {
    if (this.score >= 90) return "Excellent";
    if (this.score >= 80) return "Very Good";
    if (this.score >= 70) return "Good";
    if (this.score >= 60) return "Satisfactory";
    return "Needs Improvement";
  }

  get formattedScore(): string {
    return `${this.score}%`;
  }
}
