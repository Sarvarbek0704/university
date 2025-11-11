import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  Default,
  AllowNull,
} from "sequelize-typescript";
import { InfoStudent } from "../../info_students/models/info_student.model";

@Table({
  tableName: "education_types",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["name"],
    },
    {
      fields: ["duration_years"],
    },
    {
      fields: ["is_active"],
    },
  ],
})
export class EducationType extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.ENUM(
      "BACHELOR",
      "MASTER",
      "DOCTORATE",
      "ASSOCIATE",
      "SPECIALIST",
      "CERTIFICATE"
    ),
    allowNull: false,
    defaultValue: "BACHELOR",
    validate: {
      notEmpty: {
        msg: "Education type name cannot be empty",
      },
      isIn: {
        args: [
          [
            "BACHELOR",
            "MASTER",
            "DOCTORATE",
            "ASSOCIATE",
            "SPECIALIST",
            "CERTIFICATE",
          ],
        ],
        msg: "Invalid education type",
      },
    },
  })
  name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 4,
    validate: {
      min: {
        args: [1],
        msg: "Duration must be at least 1 year",
      },
      max: {
        args: [6],
        msg: "Duration cannot exceed 6 years",
      },
    },
  })
  duration_years: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_active: boolean;

    @HasMany(() => InfoStudent)
    infoStudents: InfoStudent[];
}
