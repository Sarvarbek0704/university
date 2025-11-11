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
  tableName: "exam_attempts",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["exam_id", "student_id", "attempt_number"],
      name: "unique_exam_student_attempt",
    },
    {
      fields: ["exam_id"],
    },
    {
      fields: ["student_id"],
    },
    {
      fields: ["attempt_number"],
    },
    {
      fields: ["status"],
    },
    {
      fields: ["score"],
    },
    {
      fields: ["attempt_date"],
    },
  ],
})
export class ExamAttempt extends Model {
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
        args: [1],
        msg: "Attempt number must be at least 1",
      },
      max: {
        args: [5],
        msg: "Attempt number cannot exceed 5",
      },
    },
  })
  attempt_number: number;

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
    type: DataType.DATE,
    allowNull: false,
  })
  attempt_date: Date;

  @Column({
    type: DataType.ENUM(
      "FIRST_ATTEMPT",
      "RETAKE_1",
      "RETAKE_2",
      "FINAL_RETAKE",
      "TRANSFER_GRADE",
      "NOT_ATTENDED"
    ),
    allowNull: false,
    defaultValue: "FIRST_ATTEMPT",
    validate: {
      isIn: {
        args: [
          [
            "FIRST_ATTEMPT",
            "RETAKE_1",
            "RETAKE_2",
            "FINAL_RETAKE",
            "TRANSFER_GRADE",
            "NOT_ATTENDED",
          ],
        ],
        msg: "Invalid attempt status",
      },
    },
  })
  status: string;

  @Default(0)
  @Column({
    type: DataType.DECIMAL(8, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: "Retake fee cannot be negative",
      },
    },
  })
  retake_fee: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  remarks: string;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  start_time: string;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  end_time: string;

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
  is_fee_paid: boolean;

  @BelongsTo(() => Exam)
  exam: Exam;

  @BelongsTo(() => Student)
  student: Student;

  @BeforeUpdate
  @BeforeCreate
  static validateExamAttempt(attempt: ExamAttempt) {
    // Vaqt formati tekshirish
    if (attempt.start_time) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(attempt.start_time)) {
        throw new Error("Start time must be in HH:MM format");
      }
    }

    if (attempt.end_time) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(attempt.end_time)) {
        throw new Error("End time must be in HH:MM format");
      }
    }

    // Agar ikkala vaqt ham berilgan bo'lsa, tekshirish
    if (attempt.start_time && attempt.end_time) {
      const start = new Date(`1970-01-01T${attempt.start_time}`);
      const end = new Date(`1970-01-01T${attempt.end_time}`);

      if (start >= end) {
        throw new Error("Start time must be before end time");
      }
    }

    // Retake fee statusini tekshirish
    if (attempt.retake_fee > 0 && attempt.is_fee_paid) {
      // To'lov qilingan bo'lsa, tekshirish kerak
    }
  }

  get isPassed(): boolean {
    return this.score >= 60; // 60% for passing
  }

  get isFirstAttempt(): boolean {
    return this.status === "FIRST_ATTEMPT";
  }

  get isRetake(): boolean {
    return ["RETAKE_1", "RETAKE_2", "FINAL_RETAKE"].includes(this.status);
  }

  get isFinalAttempt(): boolean {
    return this.status === "FINAL_RETAKE";
  }

  get isTransferGrade(): boolean {
    return this.status === "TRANSFER_GRADE";
  }

  get isNotAttended(): boolean {
    return this.status === "NOT_ATTENDED";
  }

  get duration(): number {
    if (this.start_time && this.end_time) {
      const start = new Date(`1970-01-01T${this.start_time}`);
      const end = new Date(`1970-01-01T${this.end_time}`);
      return (end.getTime() - start.getTime()) / (1000 * 60); // daqiqalarda
    }
    return 0;
  }

  get formattedDuration(): string {
    const minutes = this.duration;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  get grade(): string {
    if (this.score >= 90) return "A";
    if (this.score >= 80) return "B";
    if (this.score >= 70) return "C";
    if (this.score >= 60) return "D";
    if (this.score >= 50) return "E";
    return "F";
  }

  get performanceLevel(): string {
    if (this.score >= 90) return "Excellent";
    if (this.score >= 80) return "Very Good";
    if (this.score >= 70) return "Good";
    if (this.score >= 60) return "Satisfactory";
    return "Needs Improvement";
  }

  calculateImprovement(previousScore: number): number {
    return this.score - previousScore;
  }
}
