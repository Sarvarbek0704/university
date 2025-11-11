import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Installment } from "./models/installment.model";
import { RentContract } from "../rent_contracts/models/rent_contract.model";
import { Student } from "../students/models/student.model";
import { CreateInstallmentDto } from "./dto/create-installment.dto";
import { UpdateInstallmentDto } from "./dto/update-installment.dto";
import { PayInstallmentDto } from "./dto/pay-installment.dto";
import { FilterInstallmentDto } from "./dto/filter-installment.dto";

@Injectable()
export class InstallmentsService {
  constructor(
    @InjectModel(Installment)
    private readonly installmentModel: typeof Installment,
    @InjectModel(RentContract)
    private readonly rentContractModel: typeof RentContract,
    @InjectModel(Student)
    private readonly studentModel: typeof Student
  ) {}

  async create(
    createInstallmentDto: CreateInstallmentDto
  ): Promise<Installment> {
    if (
      !createInstallmentDto?.contract_id ||
      !createInstallmentDto?.due_date ||
      !createInstallmentDto?.amount
    ) {
      throw new BadRequestException(
        "Contract ID, due date and amount are required"
      );
    }

    // Check if rent contract exists
    const rentContract = await this.rentContractModel.findByPk(
      createInstallmentDto.contract_id
    );
    if (!rentContract) {
      throw new NotFoundException("Rent contract not found");
    }

    // Validate due date is within contract period
    const dueDate = new Date(createInstallmentDto.due_date);
    const startDate = new Date(rentContract.start_date);
    const endDate = new Date(rentContract.end_date);

    if (dueDate < startDate || dueDate > endDate) {
      throw new BadRequestException("Due date must be within contract period");
    }

    const installment = await this.installmentModel.create({
      contract_id: createInstallmentDto.contract_id,
      due_date: createInstallmentDto.due_date,
      amount: createInstallmentDto.amount,
      paid_amount: createInstallmentDto.paid_amount || 0,
      status: createInstallmentDto.status || "PENDING",
      payment_date: createInstallmentDto.payment_date,
    } as any);

    return this.findOne(installment.id);
  }

  async findAll(filterDto: FilterInstallmentDto): Promise<Installment[]> {
    const whereClause: any = {};

    if (filterDto.contract_id) {
      whereClause.contract_id = filterDto.contract_id;
    }

    if (filterDto.status) {
      whereClause.status = filterDto.status;
    }

    if (filterDto.start_due_date && filterDto.end_due_date) {
      whereClause.due_date = {
        [Op.between]: [filterDto.start_due_date, filterDto.end_due_date],
      };
    } else if (filterDto.start_due_date) {
      whereClause.due_date = {
        [Op.gte]: filterDto.start_due_date,
      };
    } else if (filterDto.end_due_date) {
      whereClause.due_date = {
        [Op.lte]: filterDto.end_due_date,
      };
    }

    if (filterDto.overdue) {
      const now = new Date();
      whereClause.due_date = {
        ...whereClause.due_date,
        [Op.lt]: now,
      };
      whereClause.status = {
        [Op.in]: ["PENDING", "OVERDUE"],
      };
    }

    const include: any[] = [
      {
        model: RentContract,
        attributes: ["id", "address", "monthly_rent"],
        include: [
          {
            model: Student,
            attributes: ["id", "full_name", "phone", "email"],
          },
        ],
      },
    ];

    // If filtering by student_id, add condition to RentContract
    if (filterDto.student_id) {
      include[0].where = {
        student_id: filterDto.student_id,
      };
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.installmentModel.findAll({
      where: whereClause,
      include,
      order: [[filterDto.sort_by || "due_date", filterDto.sort_order || "ASC"]],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<Installment> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid installment ID");
    }

    const installment = await this.installmentModel.findByPk(id, {
      include: [
        {
          model: RentContract,
          attributes: [
            "id",
            "address",
            "monthly_rent",
            "university_support_percent",
          ],
          include: [
            {
              model: Student,
              attributes: ["id", "full_name", "phone", "email", "balance"],
            },
          ],
        },
      ],
    });

    if (!installment) {
      throw new NotFoundException(`Installment with ID ${id} not found`);
    }

    return installment;
  }

  async findByContract(contractId: number): Promise<Installment[]> {
    if (!contractId || isNaN(contractId)) {
      throw new BadRequestException("Invalid contract ID");
    }

    const rentContract = await this.rentContractModel.findByPk(contractId);
    if (!rentContract) {
      throw new NotFoundException(
        `Rent contract with ID ${contractId} not found`
      );
    }

    return this.installmentModel.findAll({
      where: { contract_id: contractId },
      include: [
        {
          model: RentContract,
          attributes: ["id", "address", "monthly_rent"],
          include: [
            {
              model: Student,
              attributes: ["id", "full_name"],
            },
          ],
        },
      ],
      order: [["due_date", "ASC"]],
    });
  }

  async findByStudent(studentId: number): Promise<Installment[]> {
    if (!studentId || isNaN(studentId)) {
      throw new BadRequestException("Invalid student ID");
    }

    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return this.installmentModel.findAll({
      include: [
        {
          model: RentContract,
          where: { student_id: studentId },
          attributes: ["id", "address", "monthly_rent"],
          include: [
            {
              model: Student,
              attributes: ["id", "full_name"],
            },
          ],
        },
      ],
      order: [["due_date", "ASC"]],
    });
  }

  async getOverdueInstallments(): Promise<Installment[]> {
    const now = new Date();

    return this.installmentModel.findAll({
      where: {
        due_date: {
          [Op.lt]: now,
        },
        status: {
          [Op.in]: ["PENDING", "OVERDUE"],
        },
      },
      include: [
        {
          model: RentContract,
          attributes: ["id", "address"],
          include: [
            {
              model: Student,
              attributes: ["id", "full_name", "phone", "email"],
            },
          ],
        },
      ],
      order: [["due_date", "ASC"]],
    });
  }

  async update(
    id: number,
    updateInstallmentDto: UpdateInstallmentDto
  ): Promise<Installment> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid installment ID");
    }

    const installment = await this.findOne(id);

    if (updateInstallmentDto.contract_id) {
      const rentContract = await this.rentContractModel.findByPk(
        updateInstallmentDto.contract_id
      );
      if (!rentContract) {
        throw new NotFoundException("Rent contract not found");
      }
    }

    await installment.update(updateInstallmentDto);

    // Update status to OVERDUE if due date passed and still PENDING
    if (installment.status === "PENDING") {
      const now = new Date();
      if (installment.due_date < now) {
        await installment.update({ status: "OVERDUE" });
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid installment ID");
    }

    const installment = await this.findOne(id);

    // Prevent deletion of paid installments
    if (installment.status === "PAID" && Number(installment.paid_amount) > 0) {
      throw new ConflictException("Cannot delete paid installment");
    }

    await installment.destroy();
    return { message: "Installment deleted successfully" };
  }

  async payInstallment(
    id: number,
    payInstallmentDto: PayInstallmentDto
  ): Promise<Installment> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid installment ID");
    }

    const installment = await this.findOne(id);

    if (installment.status === "PAID" && installment.is_fully_paid) {
      throw new ConflictException("Installment is already fully paid");
    }

    if (installment.status === "CANCELLED") {
      throw new ConflictException("Cannot pay cancelled installment");
    }

    const paidAmount = payInstallmentDto.paid_amount;
    const paymentDate = payInstallmentDto.payment_date
      ? new Date(payInstallmentDto.payment_date)
      : new Date();

    await installment.markAsPaid(
      paidAmount,
      paymentDate,
      payInstallmentDto.notes
    );

    return this.findOne(id);
  }

  async updateStatus(id: number, status: string): Promise<Installment> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid installment ID");
    }

    const validStatuses = ["PENDING", "PAID", "OVERDUE", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException("Invalid status");
    }

    const installment = await this.findOne(id);

    // Validate status transitions
    if (installment.status === "PAID" && status !== "PAID") {
      throw new ConflictException("Cannot change status from PAID");
    }

    if (status === "PAID" && !installment.is_fully_paid) {
      throw new ConflictException(
        "Cannot mark as PAID when installment is not fully paid"
      );
    }

    await installment.update({ status });

    return this.findOne(id);
  }

  async getOverdueDays(id: number): Promise<{ overdue_days: number }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid installment ID");
    }

    const installment = await this.findOne(id);
    const overdueDays = await installment.calculateOverdueDays();

    return { overdue_days: overdueDays };
  }

  async generateInstallments(
    contractId: number
  ): Promise<{ message: string; count: number }> {
    if (!contractId || isNaN(contractId)) {
      throw new BadRequestException("Invalid contract ID");
    }

    const rentContract = await this.rentContractModel.findByPk(contractId, {
      include: [Student],
    });

    if (!rentContract) {
      throw new NotFoundException(
        `Rent contract with ID ${contractId} not found`
      );
    }

    // Check if installments already exist for this contract
    const existingInstallments = await this.installmentModel.count({
      where: { contract_id: contractId },
    });

    if (existingInstallments > 0) {
      throw new ConflictException(
        "Installments already exist for this contract"
      );
    }

    const startDate = new Date(rentContract.start_date);
    const endDate = new Date(rentContract.end_date);
    const installments: any[] = [];

    let currentDate = new Date(startDate);
    let monthCount = 0;

    // Create monthly installments
    while (currentDate <= endDate) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + monthCount);
      dueDate.setDate(1); // First day of the month

      if (dueDate > endDate) break;

      installments.push({
        contract_id: contractId,
        due_date: dueDate,
        amount: Number(rentContract.monthly_rent),
        paid_amount: 0,
        status: "PENDING",
        created_at: new Date(),
      });

      monthCount++;
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    if (installments.length === 0) {
      throw new BadRequestException(
        "No installments could be generated for the contract period"
      );
    }

    await this.installmentModel.bulkCreate(installments);

    return {
      message: `Successfully generated ${installments.length} installments`,
      count: installments.length,
    };
  }

  async getInstallmentsStats(): Promise<any> {
    const total = await this.installmentModel.count();

    const statusCounts = await this.installmentModel.findAll({
      attributes: [
        "status",
        [
          this.installmentModel.sequelize!.fn(
            "COUNT",
            this.installmentModel.sequelize!.col("id")
          ),
          "count",
        ],
        [
          this.installmentModel.sequelize!.fn(
            "SUM",
            this.installmentModel.sequelize!.col("amount")
          ),
          "total_amount",
        ],
        [
          this.installmentModel.sequelize!.fn(
            "SUM",
            this.installmentModel.sequelize!.col("paid_amount")
          ),
          "total_paid",
        ],
      ],
      group: ["status"],
      raw: true,
    });

    const totalAmount = await this.installmentModel.sum("amount");
    const totalPaid = await this.installmentModel.sum("paid_amount");
    const overdueCount = await this.installmentModel.count({
      where: {
        due_date: {
          [Op.lt]: new Date(),
        },
        status: {
          [Op.in]: ["PENDING", "OVERDUE"],
        },
      },
    });

    return {
      total,
      total_amount: totalAmount || 0,
      total_paid: totalPaid || 0,
      total_pending:
        totalAmount && totalPaid ? totalAmount - totalPaid : totalAmount || 0,
      overdue_count: overdueCount,
      by_status: statusCounts,
    };
  }

  async updateOverdueStatuses(): Promise<{ updated: number }> {
    const now = new Date();

    const [updatedCount] = await this.installmentModel.update(
      { status: "OVERDUE" },
      {
        where: {
          due_date: {
            [Op.lt]: now,
          },
          status: "PENDING",
        },
      }
    );

    return { updated: updatedCount };
  }
}
