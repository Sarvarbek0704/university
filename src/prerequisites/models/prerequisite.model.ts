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
import { Subject } from "../../subjects/models/subject.model";

@Table({
  tableName: "prerequisites",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["subject_id", "prerequisite_subject_id"],
      name: "unique_prerequisite_relation",
    },
    {
      fields: ["subject_id"],
    },
    {
      fields: ["prerequisite_subject_id"],
    },
    {
      fields: ["required_grade"],
    },
    {
      fields: ["is_mandatory"],
    },
    {
      fields: ["is_active"],
    },
  ],
})
export class Prerequisite extends Model {
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

  @ForeignKey(() => Subject)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Prerequisite subject ID must be a positive number",
      },
    },
  })
  prerequisite_subject_id: number;

  @Column({
    type: DataType.ENUM("A", "B", "C", "MINIMUM"),
    allowNull: false,
    defaultValue: "MINIMUM",
    validate: {
      isIn: {
        args: [["A", "B", "C", "MINIMUM"]],
        msg: "Invalid required grade",
      },
    },
  })
  required_grade: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  note: string;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_mandatory: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [1],
        msg: "Minimum semester must be at least 1",
      },
      max: {
        args: [8],
        msg: "Minimum semester cannot exceed 8",
      },
    },
  })
  min_semester: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: "Minimum score must be at least 0",
      },
      max: {
        args: [100],
        msg: "Minimum score cannot exceed 100",
      },
    },
  })
  min_score: number;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_active: boolean;

  @BelongsTo(() => Subject, "subject_id")
  subject: Subject;

  @BelongsTo(() => Subject, "prerequisite_subject_id")
  prerequisite_subject: Subject;

  @BeforeUpdate
  @BeforeCreate
  static validatePrerequisite(prerequisite: Prerequisite) {
    // O'ziga prerequisite qo'shmasligini tekshirish
    if (prerequisite.subject_id === prerequisite.prerequisite_subject_id) {
      throw new Error("Subject cannot be a prerequisite for itself");
    }

    // Minimal ball va baho mosligini tekshirish
    if (prerequisite.min_score && prerequisite.required_grade !== "MINIMUM") {
      throw new Error(
        "Min score can only be set when required grade is MINIMUM"
      );
    }

    // Baho talablari uchun minimal ballarni belgilash
    if (prerequisite.required_grade !== "MINIMUM" && !prerequisite.min_score) {
      switch (prerequisite.required_grade) {
        case "A":
          prerequisite.min_score = 90;
          break;
        case "B":
          prerequisite.min_score = 80;
          break;
        case "C":
          prerequisite.min_score = 70;
          break;
      }
    }
  }

  get isGradeA(): boolean {
    return this.required_grade === "A";
  }

  get isGradeB(): boolean {
    return this.required_grade === "B";
  }

  get isGradeC(): boolean {
    return this.required_grade === "C";
  }

  get isMinimumGrade(): boolean {
    return this.required_grade === "MINIMUM";
  }

  get requiredScore(): number {
    if (this.min_score) {
      return this.min_score;
    }

    switch (this.required_grade) {
      case "A":
        return 90;
      case "B":
        return 80;
      case "C":
        return 70;
      default:
        return 60; // Default passing score
    }
  }

  get gradeDescription(): string {
    switch (this.required_grade) {
      case "A":
        return "Excellent (90% or higher)";
      case "B":
        return "Good (80% or higher)";
      case "C":
        return "Satisfactory (70% or higher)";
      case "MINIMUM":
        return `Minimum passing (${this.min_score || 60}% or higher)`;
      default:
        return "Minimum passing";
    }
  }

  checkPrerequisite(
    completedScore: number,
    completedSemester?: number
  ): boolean {
    // Semester talabini tekshirish
    if (
      this.min_semester &&
      completedSemester &&
      completedSemester < this.min_semester
    ) {
      return false;
    }

    // Ball talabini tekshirish
    return completedScore >= this.requiredScore;
  }

  getPrerequisiteStatus(
    completedScore: number,
    completedSemester?: number
  ): {
    met: boolean;
    reasons: string[];
    details: string;
  } {
    const status = {
      met: true,
      reasons: [] as string[],
      details: "",
    };

    // Semester tekshiruvi
    if (
      this.min_semester &&
      completedSemester &&
      completedSemester < this.min_semester
    ) {
      status.met = false;
      status.reasons.push(
        `Minimum semester ${this.min_semester} required, but completed in semester ${completedSemester}`
      );
    }

    // Ball tekshiruvi
    if (completedScore < this.requiredScore) {
      status.met = false;
      status.reasons.push(
        `Score ${completedScore} is below required ${this.requiredScore} (${this.gradeDescription})`
      );
    }

    // Tafsilotli ma'lumot
    if (status.met) {
      status.details = `Prerequisite met: ${this.gradeDescription}`;
    } else {
      status.details = `Prerequisite not met: ${status.reasons.join("; ")}`;
    }

    return status;
  }
}
