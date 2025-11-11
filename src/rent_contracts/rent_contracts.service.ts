import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { RentContract } from "./models/rent_contract.model";
import { Student } from "../students/models/student.model";
// import { Installment } from "../installments/models/installment.model";

@Injectable()
export class RentContractsService {
  constructor(
    @InjectModel(RentContract)
    private readonly rentContractModel: typeof RentContract,
    @InjectModel(Student)
    private readonly studentModel: typeof Student
    // @InjectModel(Installment)
    // private readonly installmentModel: typeof Installment
  ) {}

  async create(createRentContractDto: any): Promise<RentContract> {
    if (
      !createRentContractDto?.student_id ||
      !createRentContractDto?.address ||
      !createRentContractDto?.monthly_rent ||
      !createRentContractDto?.start_date ||
      !createRentContractDto?.end_date ||
      !createRentContractDto?.landlord_name
    ) {
      throw new BadRequestException(
        "Student ID, address, monthly rent, dates and landlord name are required"
      );
    }

    // Check if student exists
    const student = await this.studentModel.findByPk(
      createRentContractDto.student_id
    );
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    // Check if student already has active rent contract
    const existingActiveContract = await this.rentContractModel.findOne({
      where: {
        student_id: createRentContractDto.student_id,
        status: "ACTIVE",
        is_active: true,
      },
    });

    if (existingActiveContract) {
      throw new ConflictException(
        "Student already has an active rent contract"
      );
    }

    // Validate dates
    const startDate = new Date(createRentContractDto.start_date);
    const endDate = new Date(createRentContractDto.end_date);

    if (startDate >= endDate) {
      throw new BadRequestException("End date must be after start date");
    }

    const rentContract = await this.rentContractModel.create({
      student_id: createRentContractDto.student_id,
      address: createRentContractDto.address,
      monthly_rent: createRentContractDto.monthly_rent,
      university_support_percent:
        createRentContractDto.university_support_percent,
      start_date: createRentContractDto.start_date,
      end_date: createRentContractDto.end_date,
      landlord_name: createRentContractDto.landlord_name,
      landlord_phone: createRentContractDto.landlord_phone,
      property_description: createRentContractDto.property_description,
      contract_number: createRentContractDto.contract_number,
      status: createRentContractDto.status || "ACTIVE",
    } as any);

    return this.findOne(rentContract.id);
  }

  async findAll(filterDto: any): Promise<RentContract[]> {
    const whereClause: any = {};

    if (filterDto.search) {
      whereClause[Op.or] = [
        { address: { [Op.iLike]: `%${filterDto.search}%` } },
        { landlord_name: { [Op.iLike]: `%${filterDto.search}%` } },
        { contract_number: { [Op.iLike]: `%${filterDto.search}%` } },
      ];
    }

    if (filterDto.student_id) {
      whereClause.student_id = filterDto.student_id;
    }

    if (filterDto.status) {
      whereClause.status = filterDto.status;
    }

    if (filterDto.start_date) {
      whereClause.start_date = {
        [Op.gte]: filterDto.start_date,
      };
    }

    if (filterDto.end_date) {
      whereClause.end_date = {
        [Op.lte]: filterDto.end_date,
      };
    }

    if (filterDto.min_rent !== undefined) {
      whereClause.monthly_rent = {
        ...whereClause.monthly_rent,
        [Op.gte]: filterDto.min_rent,
      };
    }

    if (filterDto.max_rent !== undefined) {
      whereClause.monthly_rent = {
        ...whereClause.monthly_rent,
        [Op.lte]: filterDto.max_rent,
      };
    }

    if (filterDto.min_support !== undefined) {
      whereClause.university_support_percent = {
        ...whereClause.university_support_percent,
        [Op.gte]: filterDto.min_support,
      };
    }

    if (filterDto.max_support !== undefined) {
      whereClause.university_support_percent = {
        ...whereClause.university_support_percent,
        [Op.lte]: filterDto.max_support,
      };
    }

    if (filterDto.is_active !== undefined) {
      whereClause.is_active = filterDto.is_active;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.rentContractModel.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "phone", "email"],
        },
      ],
      order: [
        [filterDto.sort_by || "start_date", filterDto.sort_order || "DESC"],
      ],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<RentContract> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid rent contract ID");
    }

    const rentContract = await this.rentContractModel.findByPk(id, {
      include: [
        {
          model: Student,
          attributes: [
            "id",
            "full_name",
            "phone",
            "email",
            "address",
            "balance",
          ],
        },
      ],
    });

    if (!rentContract) {
      throw new NotFoundException(`Rent contract with ID ${id} not found`);
    }

    return rentContract;
  }

  async findOneWithInstallments(id: number): Promise<RentContract> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid rent contract ID");
    }

    const rentContract = await this.rentContractModel.findByPk(id, {
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "phone", "email"],
        },
        // {
        //   model: Installment,
        //   attributes: ["id", "due_date", "amount", "paid_amount", "status"],
        //   order: [["due_date", "ASC"]],
        // },
      ],
    });

    if (!rentContract) {
      throw new NotFoundException(`Rent contract with ID ${id} not found`);
    }

    return rentContract;
  }

  async findByStudent(studentId: number): Promise<RentContract[]> {
    if (!studentId || isNaN(studentId)) {
      throw new BadRequestException("Invalid student ID");
    }

    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return this.rentContractModel.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "phone", "email"],
        },
      ],
      order: [["start_date", "DESC"]],
    });
  }

  async findActiveByStudent(studentId: number): Promise<RentContract> {
    if (!studentId || isNaN(studentId)) {
      throw new BadRequestException("Invalid student ID");
    }

    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const rentContract = await this.rentContractModel.findOne({
      where: {
        student_id: studentId,
        status: "ACTIVE",
        is_active: true,
      },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "phone", "email"],
        },
      ],
    });

    if (!rentContract) {
      throw new NotFoundException(
        `Active rent contract not found for student ID ${studentId}`
      );
    }

    return rentContract;
  }

  async getActiveContracts(): Promise<RentContract[]> {
    return this.rentContractModel.findAll({
      where: {
        status: "ACTIVE",
        is_active: true,
      },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "phone", "email"],
        },
      ],
      order: [["start_date", "ASC"]],
    });
  }

  async getExpiringContracts(): Promise<RentContract[]> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return this.rentContractModel.findAll({
      where: {
        status: "ACTIVE",
        is_active: true,
        end_date: {
          [Op.lte]: thirtyDaysFromNow,
          [Op.gte]: new Date(), // Exclude already expired
        },
      },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "phone", "email"],
        },
      ],
      order: [["end_date", "ASC"]],
    });
  }

  async update(id: number, updateRentContractDto: any): Promise<RentContract> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid rent contract ID");
    }

    const rentContract = await this.findOne(id);

    if (updateRentContractDto.student_id) {
      const student = await this.studentModel.findByPk(
        updateRentContractDto.student_id
      );
      if (!student) {
        throw new NotFoundException("Student not found");
      }

      // Check if new student already has active contract (excluding current one)
      if (updateRentContractDto.student_id !== rentContract.student_id) {
        const existingActiveContract = await this.rentContractModel.findOne({
          where: {
            student_id: updateRentContractDto.student_id,
            status: "ACTIVE",
            is_active: true,
            id: { [Op.ne]: id },
          },
        });

        if (existingActiveContract) {
          throw new ConflictException(
            "Student already has an active rent contract"
          );
        }
      }
    }

    // Validate dates if updating
    if (updateRentContractDto.start_date || updateRentContractDto.end_date) {
      const startDate = new Date(
        updateRentContractDto.start_date || rentContract.start_date
      );
      const endDate = new Date(
        updateRentContractDto.end_date || rentContract.end_date
      );

      if (startDate >= endDate) {
        throw new BadRequestException("End date must be after start date");
      }
    }

    await rentContract.update(updateRentContractDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid rent contract ID");
    }

    const rentContract = await this.findOne(id);

    // Check if contract has installments
    // const installmentCount = await rentContract.$count("installments");
    // if (installmentCount > 0) {
    //   throw new ConflictException(
    //     "Cannot delete rent contract with associated installments"
    //   );
    // }

    await rentContract.destroy();
    return { message: "Rent contract deleted successfully" };
  }

  async updateStatus(id: number, status: string): Promise<RentContract> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid rent contract ID");
    }

    const validStatuses = ["ACTIVE", "EXPIRED", "TERMINATED", "PENDING"];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException("Invalid status");
    }

    const rentContract = await this.findOne(id);
    await rentContract.update({ status });

    return this.findOne(id);
  }

  async toggleStatus(id: number): Promise<RentContract> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid rent contract ID");
    }

    const rentContract = await this.findOne(id);
    await rentContract.update({ is_active: !rentContract.is_active });

    return this.findOne(id);
  }

  async calculatePaymentSchedule(id: number): Promise<any> {
    const rentContract = await this.findOne(id);

    const startDate = new Date(rentContract.start_date);
    const endDate = new Date(rentContract.end_date);
    const paymentSchedule: any[] = [];

    let currentDate = new Date(startDate);
    let monthCount = 0;

    while (currentDate <= endDate) {
      const dueDate = new Date(currentDate);
      dueDate.setDate(1); // First day of the month
      dueDate.setMonth(currentDate.getMonth() + monthCount);

      if (dueDate > endDate) break;

      paymentSchedule.push({
        month: dueDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        due_date: dueDate.toISOString().split("T")[0],
        monthly_rent: Number(rentContract.monthly_rent),
        university_support: Number(rentContract.university_support_amount),
        student_payment: Number(rentContract.student_payment_amount),
      });

      monthCount++;
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return {
      contract: {
        id: rentContract.id,
        address: rentContract.address,
        total_months: paymentSchedule.length,
        total_value: Number(rentContract.monthly_rent) * paymentSchedule.length,
        total_university_support:
          Number(rentContract.university_support_amount) *
          paymentSchedule.length,
        total_student_payment:
          Number(rentContract.student_payment_amount) * paymentSchedule.length,
      },
      payment_schedule: paymentSchedule,
    };
  }

  async getRentContractsStats(): Promise<any> {
    const total = await this.rentContractModel.count();
    const active = await this.rentContractModel.count({
      where: {
        status: "ACTIVE",
        is_active: true,
      },
    });

    const expired = await this.rentContractModel.count({
      where: { status: "EXPIRED" },
    });

    const totalMonthlyRent = await this.rentContractModel.sum("monthly_rent", {
      where: {
        status: "ACTIVE",
        is_active: true,
      },
    });

    const avgSupportPercent = await this.rentContractModel.findOne({
      attributes: [
        [
          this.rentContractModel.sequelize!.fn(
            "AVG",
            this.rentContractModel.sequelize!.col("university_support_percent")
          ),
          "avg_support",
        ],
      ],
      where: {
        status: "ACTIVE",
        is_active: true,
      },
      raw: true,
    });

    const statusCounts = await this.rentContractModel.findAll({
      attributes: [
        "status",
        [
          this.rentContractModel.sequelize!.fn(
            "COUNT",
            this.rentContractModel.sequelize!.col("id")
          ),
          "count",
        ],
      ],
      group: ["status"],
      raw: true,
    });

    return {
      total,
      active,
      expired,
      total_monthly_rent: totalMonthlyRent || 0,
      // average_support_percent: avgSupportPercent?.avg_support || 0,
      by_status: statusCounts,
    };
  }
}
