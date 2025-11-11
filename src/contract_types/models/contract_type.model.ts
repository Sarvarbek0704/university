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
  tableName: "contract_types",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["name"],
    },
    {
      fields: ["coverage_percent"],
    },
    {
      fields: ["is_active"],
    },
  ],
})
export class ContractType extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.ENUM("STATE_GRANT", "FEE_PAYING", "PARTIAL_GRANT"),
    allowNull: false,
    defaultValue: "FEE_PAYING",
    validate: {
      notEmpty: {
        msg: "Contract type name cannot be empty",
      },
      isIn: {
        args: [["STATE_GRANT", "FEE_PAYING", "PARTIAL_GRANT"]],
        msg: "Invalid contract type",
      },
    },
  })
  name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: "Coverage percent cannot be negative",
      },
      max: {
        args: [100],
        msg: "Coverage percent cannot exceed 100",
      },
    },
  })
  coverage_percent: number;

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
