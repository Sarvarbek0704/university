import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  Default,
  AllowNull,
  BeforeUpdate,
  BeforeCreate,
} from "sequelize-typescript";
import { Subject } from "../../subjects/models/subject.model";
import { Group } from "../../groups/models/group.model";
import { Teacher } from "../../teachers/models/teacher.model";
import { ExamResult } from "../../exam_results/models/exam_result.model";
import { ExamAttempt } from "../../exam_attempts/models/exam_attempt.model";

@Table({
  tableName: "exams",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ["subject_id"],
    },
    {
      fields: ["group_id"],
    },
    {
      fields: ["teacher_id"],
    },
    {
      fields: ["exam_date"],
    },
    {
      fields: ["exam_type"],
    },
    {
      fields: ["is_active"],
    },
  ],
})
export class Exam extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Subject)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Subject ID must be a positive number",
      },
    },
  })
  subject_id: number;

  @ForeignKey(() => Group)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Group ID must be a positive number",
      },
    },
  })
  group_id: number;

  @ForeignKey(() => Teacher)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Teacher ID must be a positive number",
      },
    },
  })
  teacher_id: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  exam_date: Date;

  @Column({
    type: DataType.ENUM(
      "MIDTERM",
      "FINAL",
      "QUIZ",
      "RETAKE",
      "ORAL",
      "PRACTICAL",
      "THESIS_DEFENSE"
    ),
    allowNull: false,
    defaultValue: "MIDTERM",
    validate: {
      isIn: {
        args: [
          [
            "MIDTERM",
            "FINAL",
            "QUIZ",
            "RETAKE",
            "ORAL",
            "PRACTICAL",
            "THESIS_DEFENSE",
          ],
        ],
        msg: "Invalid exam type",
      },
    },
  })
  exam_type: string;

  @Default(50)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Max score must be at least 1",
      },
      max: {
        args: [100],
        msg: "Max score cannot exceed 100",
      },
    },
  })
  max_score: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  location: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  instructions: string;

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
    type: DataType.DECIMAL(3, 1),
    allowNull: true,
    validate: {
      min: {
        args: [0.5],
        msg: "Duration must be at least 0.5 hours",
      },
      max: {
        args: [8],
        msg: "Duration cannot exceed 8 hours",
      },
    },
  })
  duration_hours: number;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_active: boolean;

  @BelongsTo(() => Subject)
  subject: Subject;

  @BelongsTo(() => Group)
  group: Group;

  @BelongsTo(() => Teacher)
  teacher: Teacher;

  @HasMany(() => ExamResult)
  exam_results: ExamResult[];

  @HasMany(() => ExamAttempt)
  exam_attempts: ExamAttempt[];

  @BeforeUpdate
  @BeforeCreate
  static validateExam(exam: Exam) {
    // Vaqt formati tekshirish
    if (exam.start_time) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(exam.start_time)) {
        throw new Error("Start time must be in HH:MM format");
      }
    }

    if (exam.end_time) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(exam.end_time)) {
        throw new Error("End time must be in HH:MM format");
      }
    }

    // Agar ikkala vaqt ham berilgan bo'lsa, tekshirish
    if (exam.start_time && exam.end_time) {
      const start = new Date(`1970-01-01T${exam.start_time}`);
      const end = new Date(`1970-01-01T${exam.end_time}`);

      if (start >= end) {
        throw new Error("Start time must be before end time");
      }
    }

    // Imtihon sanasi o'tmishda bo'lmasligi kerak (faqat yangi yaratishda)
    if (exam.isNewRecord) {
      const examDate = new Date(exam.exam_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (examDate < today) {
        throw new Error("Exam date cannot be in the past");
      }
    }
  }

  get isUpcoming(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(this.exam_date);
    return examDate >= today;
  }

  get isPast(): boolean {
    return !this.isUpcoming;
  }

  get formattedExamDate(): string {
    return this.exam_date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  get timeRange(): string {
    if (this.start_time && this.end_time) {
      return `${this.start_time} - ${this.end_time}`;
    }
    return "TBA";
  }

  calculateAverageScore(): number {
    if (!this.exam_results || this.exam_results.length === 0) {
      return 0;
    }

    const totalScore = this.exam_results.reduce(
      (sum, result) => sum + result.score,
      0
    );
    return totalScore / this.exam_results.length;
  }

  calculatePassRate(): number {
    if (!this.exam_results || this.exam_results.length === 0) {
      return 0;
    }

    const passingScore = this.max_score * 0.6; // 60% for passing
    const passedStudents = this.exam_results.filter(
      (result) => result.score >= passingScore
    ).length;
    return (passedStudents / this.exam_results.length) * 100;
  }
}
