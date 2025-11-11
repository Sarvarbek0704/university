import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Payment } from "./models/payment.model";
import { Student } from "../students/models/student.model";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { FilterPaymentDto } from "./dto/filter-payment.dto";
import { PaymentType } from "../payment_types/models/payment_type.model";

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment)
    private readonly paymentModel: typeof Payment,
    @InjectModel(Student)
    private readonly studentModel: typeof Student,
    @InjectModel(PaymentType)
    private readonly paymentTypeModel: typeof PaymentType
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    if (
      !createPaymentDto?.student_id ||
      !createPaymentDto?.payment_type_id ||
      !createPaymentDto?.amount ||
      !createPaymentDto?.payment_date
    ) {
      throw new BadRequestException(
        "Student ID, payment type ID, amount and payment date are required"
      );
    }

    const student = await this.studentModel.findByPk(
      createPaymentDto.student_id
    );
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    const paymentType = await this.paymentTypeModel.findByPk(
      createPaymentDto.payment_type_id
    );
    if (!paymentType) {
      throw new NotFoundException("Payment type not found");
    }

    if (createPaymentDto.transaction_id) {
      const existingTransaction = await this.paymentModel.findOne({
        where: { transaction_id: createPaymentDto.transaction_id },
      });
      if (existingTransaction) {
        throw new ConflictException("Transaction ID already exists");
      }
    }

    const payment = await this.paymentModel.create({
      student_id: createPaymentDto.student_id,
      payment_type_id: createPaymentDto.payment_type_id,
      amount: createPaymentDto.amount,
      payment_date: createPaymentDto.payment_date,
      payment_method: createPaymentDto.payment_method || "CARD_ONLINE",
      status: createPaymentDto.status || "PENDING",
      description: createPaymentDto.description,
      transaction_id: createPaymentDto.transaction_id,
      reference_number: createPaymentDto.reference_number,
    } as any);

    if (payment.status === "SUCCESS") {
      await this.updateStudentBalance(payment.student_id, payment.amount);
    }

    return this.findOne(payment.id);
  }

  async findAll(filterDto: FilterPaymentDto): Promise<Payment[]> {
    const whereClause: any = {};

    if (filterDto.search) {
      whereClause[Op.or] = [
        { transaction_id: { [Op.iLike]: `%${filterDto.search}%` } },
        { reference_number: { [Op.iLike]: `%${filterDto.search}%` } },
        { description: { [Op.iLike]: `%${filterDto.search}%` } },
      ];
    }

    if (filterDto.student_id) {
      whereClause.student_id = filterDto.student_id;
    }

    if (filterDto.payment_type_id) {
      whereClause.payment_type_id = filterDto.payment_type_id;
    }

    if (filterDto.payment_method) {
      whereClause.payment_method = filterDto.payment_method;
    }

    if (filterDto.status) {
      whereClause.status = filterDto.status;
    }

    if (filterDto.start_date && filterDto.end_date) {
      whereClause.payment_date = {
        [Op.between]: [filterDto.start_date, filterDto.end_date],
      };
    } else if (filterDto.start_date) {
      whereClause.payment_date = {
        [Op.gte]: filterDto.start_date,
      };
    } else if (filterDto.end_date) {
      whereClause.payment_date = {
        [Op.lte]: filterDto.end_date,
      };
    }

    if (filterDto.min_amount !== undefined) {
      whereClause.amount = {
        ...whereClause.amount,
        [Op.gte]: filterDto.min_amount,
      };
    }

    if (filterDto.max_amount !== undefined) {
      whereClause.amount = {
        ...whereClause.amount,
        [Op.lte]: filterDto.max_amount,
      };
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.paymentModel.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "phone", "email"],
        },
        {
          model: PaymentType,
          attributes: ["id", "name", "description"],
        },
      ],
      order: [
        [filterDto.sort_by || "payment_date", filterDto.sort_order || "DESC"],
      ],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<Payment> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid payment ID");
    }

    const payment = await this.paymentModel.findByPk(id, {
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
        {
          model: PaymentType,
          attributes: ["id", "name", "description"],
        },
      ],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findByStudent(studentId: number): Promise<Payment[]> {
    if (!studentId || isNaN(studentId)) {
      throw new BadRequestException("Invalid student ID");
    }

    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return this.paymentModel.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: PaymentType,
          attributes: ["id", "name", "description"],
        },
      ],
      order: [["payment_date", "DESC"]],
    });
  }

  async findByStatus(status: string): Promise<Payment[]> {
    const validStatuses = [
      "SUCCESS",
      "PENDING",
      "FAILED",
      "REFUNDED",
      "CANCELLED",
      "REVERSED",
    ];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException("Invalid status");
    }

    return this.paymentModel.findAll({
      where: { status },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "phone", "email"],
        },
        {
          model: PaymentType,
          attributes: ["id", "name", "description"],
        },
      ],
      order: [["payment_date", "DESC"]],
    });
  }

  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto
  ): Promise<Payment> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid payment ID");
    }

    const payment = await this.findOne(id);
    const oldStatus = payment.status;
    const oldAmount = payment.amount;

    if (
      updatePaymentDto.transaction_id &&
      updatePaymentDto.transaction_id !== payment.transaction_id
    ) {
      const existingTransaction = await this.paymentModel.findOne({
        where: {
          transaction_id: updatePaymentDto.transaction_id,
          id: { [Op.ne]: id },
        },
      });
      if (existingTransaction) {
        throw new ConflictException("Transaction ID already exists");
      }
    }

    if (updatePaymentDto.student_id) {
      const student = await this.studentModel.findByPk(
        updatePaymentDto.student_id
      );
      if (!student) {
        throw new NotFoundException("Student not found");
      }
    }

    if (updatePaymentDto.payment_type_id) {
      const paymentType = await this.paymentTypeModel.findByPk(
        updatePaymentDto.payment_type_id
      );
      if (!paymentType) {
        throw new NotFoundException("Payment type not found");
      }
    }

    await payment.update(updatePaymentDto);

    const newPayment = await this.findOne(id);
    if (oldStatus !== newPayment.status || oldAmount !== newPayment.amount) {
      await this.handleBalanceUpdate(
        oldStatus,
        newPayment.status,
        oldAmount,
        newPayment.amount,
        newPayment.student_id
      );
    }

    return newPayment;
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid payment ID");
    }

    const payment = await this.findOne(id);

    if (payment.status === "SUCCESS") {
      await this.updateStudentBalance(payment.student_id, -payment.amount);
    }

    await payment.destroy();
    return { message: "Payment deleted successfully" };
  }

  async updateStatus(id: number, status: string): Promise<Payment> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid payment ID");
    }

    const validStatuses = [
      "SUCCESS",
      "PENDING",
      "FAILED",
      "REFUNDED",
      "CANCELLED",
      "REVERSED",
    ];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException("Invalid status");
    }

    const payment = await this.findOne(id);
    const oldStatus = payment.status;

    await payment.update({ status });

    if (oldStatus !== status) {
      await this.handleBalanceUpdate(
        oldStatus,
        status,
        payment.amount,
        payment.amount,
        payment.student_id
      );
    }

    return this.findOne(id);
  }

  async getPaymentsStats(): Promise<any> {
    const total = await this.paymentModel.count();
    const totalAmount = await this.paymentModel.sum("amount", {
      where: { status: "SUCCESS" },
    });

    const statusCounts = await this.paymentModel.findAll({
      attributes: [
        "status",
        [
          this.paymentModel.sequelize!.fn(
            "COUNT",
            this.paymentModel.sequelize!.col("id")
          ),
          "count",
        ],
        [
          this.paymentModel.sequelize!.fn(
            "SUM",
            this.paymentModel.sequelize!.col("amount")
          ),
          "total_amount",
        ],
      ],
      group: ["status"],
      raw: true,
    });

    const methodCounts = await this.paymentModel.findAll({
      attributes: [
        "payment_method",
        [
          this.paymentModel.sequelize!.fn(
            "COUNT",
            this.paymentModel.sequelize!.col("id")
          ),
          "count",
        ],
      ],
      group: ["payment_method"],
      raw: true,
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPayments = await this.paymentModel.count({
      where: {
        payment_date: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
    });

    return {
      total,
      total_amount: totalAmount || 0,
      by_status: statusCounts,
      by_method: methodCounts,
      recent_payments: recentPayments,
    };
  }

  async getStudentPaymentSummary(studentId: number): Promise<any> {
    if (!studentId || isNaN(studentId)) {
      throw new BadRequestException("Invalid student ID");
    }

    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const totalPaid = await this.paymentModel.sum("amount", {
      where: {
        student_id: studentId,
        status: "SUCCESS",
      },
    });

    const pendingPayments = await this.paymentModel.sum("amount", {
      where: {
        student_id: studentId,
        status: "PENDING",
      },
    });

    const paymentCount = await this.paymentModel.count({
      where: { student_id: studentId },
    });

    const successfulPayments = await this.paymentModel.count({
      where: {
        student_id: studentId,
        status: "SUCCESS",
      },
    });

    const recentPayments = await this.paymentModel.findAll({
      where: { student_id: studentId },
      limit: 5,
      order: [["payment_date", "DESC"]],
      include: [
        {
          model: PaymentType,
          attributes: ["id", "name"],
        },
      ],
    });

    return {
      student: {
        id: student.id,
        full_name: student.full_name,
        balance: student.balance,
      },
      summary: {
        total_paid: totalPaid || 0,
        pending_amount: pendingPayments || 0,
        total_payments: paymentCount,
        successful_payments: successfulPayments,
      },
      recent_payments: recentPayments,
    };
  }

  async generateReceipt(id: number): Promise<any> {
    const payment = await this.findOne(id);

    return {
      receipt: {
        payment_id: payment.id,
        student_name: payment.student.full_name,
        payment_type: payment.paymentType.name,
        amount: payment.amount,
        payment_date: payment.payment_date,
        payment_method: payment.payment_method,
        status: payment.status,
        transaction_id: payment.transaction_id,
        reference_number: payment.reference_number,
      },
      generated_at: new Date().toISOString(),
    };
  }

  private async updateStudentBalance(
    studentId: number,
    amount: number
  ): Promise<void> {
    const student = await this.studentModel.findByPk(studentId);
    if (student) {
      const newBalance = parseFloat(student.balance.toString()) + amount;
      await student.update({ balance: newBalance });
    }
  }

  private async handleBalanceUpdate(
    oldStatus: string,
    newStatus: string,
    oldAmount: number,
    newAmount: number,
    studentId: number
  ): Promise<void> {
    if (oldStatus === "SUCCESS" && newStatus !== "SUCCESS") {
      await this.updateStudentBalance(studentId, -oldAmount);
    } else if (oldStatus !== "SUCCESS" && newStatus === "SUCCESS") {
      await this.updateStudentBalance(studentId, newAmount);
    } else if (
      oldStatus === "SUCCESS" &&
      newStatus === "SUCCESS" &&
      oldAmount !== newAmount
    ) {
      const difference = newAmount - oldAmount;
      await this.updateStudentBalance(studentId, difference);
    }
  }
}
