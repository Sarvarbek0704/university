import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  Default,
  AllowNull,
  Unique,
} from "sequelize-typescript";
import { Department } from "../../departments/models/department.model";

@Table({
  tableName: "faculties",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["name"],
    },
    {
      unique: true,
      fields: ["code"],
    },
    {
      fields: ["building_number"],
    },
    {
      fields: ["is_active"],
    },
  ],
})
export class Faculty extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Unique
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Faculty name cannot be empty",
      },
      len: {
        args: [2, 100],
        msg: "Faculty name must be between 2 and 100 characters",
      },
    },
  })
  name: string;

  @Unique
  @Column({
    type: DataType.STRING(10),
    allowNull: true,
    validate: {
      len: {
        args: [1, 10],
        msg: "Faculty code must be between 1 and 10 characters",
      },
    },
  })
  code: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [1],
        msg: "Building number must be a positive number",
      },
      max: {
        args: [100],
        msg: "Building number cannot exceed 100",
      },
    },
  })
  building_number: number;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    validate: {
      is: {
        args: /^\+?[1-9]\d{1,14}$/,
        msg: "Please provide a valid phone number",
      },
    },
  })
  phone: string;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_active: boolean;

  // Associations
  @HasMany(() => Department)
  departments: Department[];
}
