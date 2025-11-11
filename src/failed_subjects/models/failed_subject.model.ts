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
import { Student } from "../../students/models/student.model";
import { Subject } from "../../subjects/models/subject.model";
import { ExamAttempt } from "../../exam_attempts/models/exam_attempt.model";

@Table({
  tableName: "failed_subjects",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["student_id", "subject_id", "exam_attempt_id"],
      name: "unique_failed_subject",
    },
    {
      fields: ["student_id"],
    },
    {
      fields: ["subject_id"],
    },
    {
      fields: ["exam_attempt_id"],
    },
    {
      fields: ["fail_reason"],
    },
    {
      fields: ["retake_required"],
    },
    {
      fields: ["is_resolved"],
    },
    {
      fields: ["retake_semester"],
    },
  ],
})
export class FailedSubject extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

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

  @ForeignKey(() => ExamAttempt)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Exam attempt ID must be a positive number",
      },
    },
  })
  exam_attempt_id: number;

  @Column({
    type: DataType.ENUM(
      "LOW_SCORE",
      "DID_NOT_ATTEND",
      "PLAGIARISM",
      "ACADEMIC_DEBT",
      "ADMIN_ISSUE",
      "EXCEEDED_ATTEMPTS"
    ),
    allowNull: false,
    defaultValue: "LOW_SCORE",
    validate: {
      isIn: {
        args: [
          [
            "LOW_SCORE",
            "DID_NOT_ATTEND",
            "PLAGIARISM",
            "ACADEMIC_DEBT",
            "ADMIN_ISSUE",
            "EXCEEDED_ATTEMPTS",
          ],
        ],
        msg: "Invalid fail reason",
      },
    },
  })
  fail_reason: string;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  retake_required: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [1],
        msg: "Retake semester must be at least 1",
      },
      max: {
        args: [8],
        msg: "Retake semester cannot exceed 8",
      },
    },
  })
  retake_semester: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: "Failed score must be at least 0",
      },
      max: {
        args: [100],
        msg: "Failed score cannot exceed 100",
      },
    },
  })
  failed_score: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  planned_retake_date: Date;

  @Default(false)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_resolved: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  resolution_notes: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  resolved_at: Date;

  @BelongsTo(() => Student)
  student: Student;

  @BelongsTo(() => Subject)
  subject: Subject;

  @BelongsTo(() => ExamAttempt)
  exam_attempt: ExamAttempt;

  @BeforeUpdate
  @BeforeCreate
  static validateFailedSubject(failedSubject: FailedSubject) {
    // Agar hal qilingan bo'lsa, resolution vaqtini belgilash
    if (failedSubject.is_resolved && !failedSubject.resolved_at) {
      failedSubject.resolved_at = new Date();
    }

    // Agar hal qilinmagan bo'lsa, resolution vaqtini tozalash
    if (!failedSubject.is_resolved && failedSubject.resolved_at) {
      failedSubject.resolved_at = null;
    }

    // Qayta topshirish kerak bo'lmasa, rejalashtirilgan sanani tekshirish
    if (!failedSubject.retake_required && failedSubject.planned_retake_date) {
      throw new Error(
        "Planned retake date should not be set when retake is not required"
      );
    }

    // Maksimal urinishlar soni sababi uchun tekshirish
    if (
      failedSubject.fail_reason === "EXCEEDED_ATTEMPTS" &&
      failedSubject.retake_required
    ) {
      throw new Error(
        "Retake cannot be required when maximum attempts exceeded"
      );
    }
  }

  get isLowScore(): boolean {
    return this.fail_reason === "LOW_SCORE";
  }

  get isNotAttended(): boolean {
    return this.fail_reason === "DID_NOT_ATTEND";
  }

  get isPlagiarism(): boolean {
    return this.fail_reason === "PLAGIARISM";
  }

  get isAcademicDebt(): boolean {
    return this.fail_reason === "ACADEMIC_DEBT";
  }

  get isAdminIssue(): boolean {
    return this.fail_reason === "ADMIN_ISSUE";
  }

  get isMaxAttempts(): boolean {
    return this.fail_reason === "EXCEEDED_ATTEMPTS";
  }

  get canRetake(): boolean {
    return this.retake_required && !this.isMaxAttempts && !this.is_resolved;
  }

  get isOverdue(): boolean {
    if (!this.planned_retake_date || this.is_resolved) {
      return false;
    }
    return new Date() > this.planned_retake_date;
  }

  get daysUntilRetake(): number {
    if (!this.planned_retake_date || this.is_resolved) {
      return null;
    }
    const today = new Date();
    const retakeDate = new Date(this.planned_retake_date);
    const diffTime = retakeDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get urgencyLevel(): string {
    if (this.is_resolved) return "RESOLVED";
    if (!this.planned_retake_date) return "NO_DATE";

    const days = this.daysUntilRetake;
    if (days < 0) return "OVERDUE";
    if (days <= 7) return "URGENT";
    if (days <= 30) return "SOON";
    return "FUTURE";
  }

  get formattedPlannedDate(): string {
    if (!this.planned_retake_date) return "Not scheduled";
    return this.planned_retake_date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  markAsResolved(notes?: string): void {
    this.is_resolved = true;
    this.resolved_at = new Date();
    if (notes) {
      this.resolution_notes = notes;
    }
  }

  scheduleRetake(date: Date, semester?: number): void {
    this.planned_retake_date = date;
    this.retake_required = true;
    if (semester) {
      this.retake_semester = semester;
    }
    this.is_resolved = false;
    this.resolved_at = null;
  }
}
