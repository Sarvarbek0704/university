import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op, fn, col } from "sequelize";
import { Student } from "../students/models/student.model";
import { Scholarship } from "../scholarships/models/scholarship.model";
import { FilterScholarshipTransactionDto } from "./dto/filter-scholarship-transaction.dto";
import { ScholarshipTransaction } from "./models/scolarship_transaction.model";
import { CreateScholarshipTransactionDto } from "./dto/create-scolarship_transaction.dto";
import { UpdateScholarshipTransactionDto } from "./dto/update-scolarship_transaction.dto";

export interface BalanceUpdateResult {
  success: boolean;
  message: string;
  newBalance: number;
}

@Injectable()
export class ScholarshipTransactionsService {
  constructor(
    @InjectModel(ScholarshipTransaction)
    private readonly scholarshipTransactionModel: typeof ScholarshipTransaction,
    @InjectModel(Student)
    private readonly studentModel: typeof Student,
    @InjectModel(Scholarship)
    private readonly scholarshipModel: typeof Scholarship
  ) {}

  async create(
    createScholarshipTransactionDto: CreateScholarshipTransactionDto
  ): Promise<ScholarshipTransaction> {
    if (
      !createScholarshipTransactionDto?.student_id ||
      !createScholarshipTransactionDto?.scholarship_id ||
      !createScholarshipTransactionDto?.amount
    ) {
      throw new BadRequestException(
        "Student ID, scholarship ID and amount are required"
      );
    }

    const student = await this.studentModel.findByPk(
      createScholarshipTransactionDto.student_id
    );
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    const scholarship = await this.scholarshipModel.findByPk(
      createScholarshipTransactionDto.scholarship_id
    );
    if (!scholarship) {
      throw new NotFoundException("Scholarship not found");
    }

    const existingTransaction = await this.scholarshipTransactionModel.findOne({
      where: {
        student_id: createScholarshipTransactionDto.student_id,
        scholarship_id: createScholarshipTransactionDto.scholarship_id,
        period: createScholarshipTransactionDto.period,
        payment_date: createScholarshipTransactionDto.payment_date,
      },
    });

    if (existingTransaction) {
      throw new ConflictException(
        "Transaction for this student, scholarship, period and date already exists"
      );
    }

    const transaction = await this.scholarshipTransactionModel.create({
      student_id: createScholarshipTransactionDto.student_id,
      scholarship_id: createScholarshipTransactionDto.scholarship_id,
      amount: createScholarshipTransactionDto.amount,
      payment_date: createScholarshipTransactionDto.payment_date,
      period: createScholarshipTransactionDto.period,
      status: createScholarshipTransactionDto.status,
      created_at: createScholarshipTransactionDto.created_at || new Date(),
      remarks: createScholarshipTransactionDto.remarks,
    } as any);

    return this.findOne(transaction.id);
  }

  async findAll(
    filterDto: FilterScholarshipTransactionDto
  ): Promise<ScholarshipTransaction[]> {
    const whereClause: any = {};

    if (filterDto.student_id) {
      whereClause.student_id = filterDto.student_id;
    }

    if (filterDto.scholarship_id) {
      whereClause.scholarship_id = filterDto.scholarship_id;
    }

    if (filterDto.status) {
      whereClause.status = filterDto.status;
    }

    if (filterDto.period) {
      whereClause.period = filterDto.period;
    }

    if (filterDto.payment_date_from && filterDto.payment_date_to) {
      whereClause.payment_date = {
        [Op.between]: [filterDto.payment_date_from, filterDto.payment_date_to],
      };
    } else if (filterDto.payment_date_from) {
      whereClause.payment_date = {
        [Op.gte]: filterDto.payment_date_from,
      };
    } else if (filterDto.payment_date_to) {
      whereClause.payment_date = {
        [Op.lte]: filterDto.payment_date_to,
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

    return this.scholarshipTransactionModel.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email"],
        },
        {
          model: Scholarship,
          attributes: ["id", "scholarship_type", "amount"],
        },
      ],
      order: [
        [filterDto.sort_by || "payment_date", filterDto.sort_order || "DESC"],
      ],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<ScholarshipTransaction> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid transaction ID");
    }

    const transaction = await this.scholarshipTransactionModel.findByPk(id, {
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email", "phone"],
        },
        {
          model: Scholarship,
          attributes: ["id", "scholarship_type", "amount", "month", "year"],
        },
      ],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async findByStudent(studentId: number): Promise<ScholarshipTransaction[]> {
    if (!studentId || isNaN(studentId)) {
      throw new BadRequestException("Invalid student ID");
    }

    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    return this.scholarshipTransactionModel.findAll({
      where: {
        student_id: studentId,
      },
      include: [
        {
          model: Scholarship,
          attributes: ["id", "scholarship_type", "amount"],
        },
      ],
      order: [["payment_date", "DESC"]],
    });
  }

  async findByScholarship(
    scholarshipId: number
  ): Promise<ScholarshipTransaction[]> {
    if (!scholarshipId || isNaN(scholarshipId)) {
      throw new BadRequestException("Invalid scholarship ID");
    }

    const scholarship = await this.scholarshipModel.findByPk(scholarshipId);
    if (!scholarship) {
      throw new NotFoundException(
        `Scholarship with ID ${scholarshipId} not found`
      );
    }

    return this.scholarshipTransactionModel.findAll({
      where: {
        scholarship_id: scholarshipId,
      },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email"],
        },
      ],
      order: [["payment_date", "DESC"]],
    });
  }

  async update(
    id: number,
    updateScholarshipTransactionDto: UpdateScholarshipTransactionDto
  ): Promise<ScholarshipTransaction> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid transaction ID");
    }

    const transaction = await this.findOne(id);

    if (updateScholarshipTransactionDto.student_id) {
      const student = await this.studentModel.findByPk(
        updateScholarshipTransactionDto.student_id
      );
      if (!student) {
        throw new NotFoundException("Student not found");
      }
    }

    if (updateScholarshipTransactionDto.scholarship_id) {
      const scholarship = await this.scholarshipModel.findByPk(
        updateScholarshipTransactionDto.scholarship_id
      );
      if (!scholarship) {
        throw new NotFoundException("Scholarship not found");
      }
    }

    await transaction.update(updateScholarshipTransactionDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid transaction ID");
    }

    const transaction = await this.findOne(id);
    await transaction.destroy();

    return { message: "Transaction deleted successfully" };
  }

  async toggleStatus(id: number): Promise<ScholarshipTransaction> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid transaction ID");
    }

    const transaction = await this.findOne(id);
    await transaction.update({ is_active: !transaction.is_active });

    return this.findOne(id);
  }

  async changeStatus(
    id: number,
    status: string
  ): Promise<ScholarshipTransaction> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid transaction ID");
    }

    const validStatuses = ["PAID", "PENDING", "FAILED"];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException("Invalid status");
    }

    const transaction = await this.findOne(id);
    await transaction.update({ status });

    return this.findOne(id);
  }

  async getTransactionsStats(): Promise<any> {
    const total = await this.scholarshipTransactionModel.count();
    const paid = await this.scholarshipTransactionModel.count({
      where: { status: "PAID" },
    });
    const pending = await this.scholarshipTransactionModel.count({
      where: { status: "PENDING" },
    });
    const failed = await this.scholarshipTransactionModel.count({
      where: { status: "FAILED" },
    });

    const totalAmount = await this.scholarshipTransactionModel.sum("amount", {
      where: { status: "PAID" },
    });

    try {
      const monthlyStats = await this.scholarshipTransactionModel.findAll({
        attributes: [
          "period",
          [fn("COUNT", col("id")), "count"],
          [fn("SUM", col("amount")), "total_amount"],
        ],
        where: { status: "PAID" },
        group: ["period"],
        raw: true,
      });

      return {
        total,
        by_status: {
          paid,
          pending,
          failed,
        },
        total_amount: totalAmount || 0,
        monthly_stats: monthlyStats,
      };
    } catch (error) {
      return {
        total,
        by_status: {
          paid,
          pending,
          failed,
        },
        total_amount: totalAmount || 0,
        monthly_stats: [],
      };
    }
  }

  async getStudentTransactionsStats(studentId: number): Promise<any> {
    if (!studentId || isNaN(studentId)) {
      throw new BadRequestException("Invalid student ID");
    }

    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const total = await this.scholarshipTransactionModel.count({
      where: { student_id: studentId },
    });
    const paid = await this.scholarshipTransactionModel.count({
      where: { student_id: studentId, status: "PAID" },
    });
    const totalAmount = await this.scholarshipTransactionModel.sum("amount", {
      where: { student_id: studentId, status: "PAID" },
    });

    const recentTransactions = await this.scholarshipTransactionModel.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: Scholarship,
          attributes: ["id", "scholarship_type"],
        },
      ],
      order: [["payment_date", "DESC"]],
      limit: 5,
    });

    return {
      student: {
        id: student.id,
        full_name: student.full_name,
      },
      stats: {
        total_transactions: total,
        paid_transactions: paid,
        total_amount_received: totalAmount || 0,
      },
      recent_transactions: recentTransactions,
    };
  }

  // ========== BALANCE PROCESSING METHODS ==========

  async processScholarshipPayment(
    transactionId: number
  ): Promise<BalanceUpdateResult> {
    const transaction = await this.findOne(transactionId);

    if (transaction.status !== "PAID") {
      throw new BadRequestException("Only PAID transactions can be processed");
    }

    if (transaction.is_processed) {
      throw new BadRequestException("Transaction already processed");
    }

    const student = await this.studentModel.findByPk(transaction.student_id);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    // Transaction summasi
    const amount = parseFloat(transaction.amount.toString());

    // Student balansini yangilash
    const currentBalance = parseFloat(student.balance.toString());
    const newBalance = currentBalance + amount;

    try {
      // Transactionni ma'lumotlar bazasida yangilash
      await this.scholarshipTransactionModel.sequelize!.transaction(
        async (t) => {
          // Student balansini yangilash
          await student.update({ balance: newBalance }, { transaction: t });

          // Transactionni "processed" deb belgilash
          await transaction.update({ is_processed: true }, { transaction: t });
        }
      );

      return {
        success: true,
        message: `Scholarship payment processed successfully. Student balance updated from $${currentBalance.toFixed(2)} to $${newBalance.toFixed(2)}`,
        newBalance,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        "Failed to process scholarship payment"
      );
    }
  }

  async createAndProcessTransaction(
    createTransactionDto: CreateScholarshipTransactionDto
  ): Promise<{
    transaction: ScholarshipTransaction;
    balanceUpdate: BalanceUpdateResult | null;
  }> {
    // Avval transaction yaratish
    const transaction = await this.create(createTransactionDto);

    let balanceUpdate: BalanceUpdateResult | null = null;

    // Agar status PAID bo'lsa, avtomatik tarzda balansni yangilash
    if (createTransactionDto.status === "PAID") {
      balanceUpdate = await this.processScholarshipPayment(transaction.id);
    }

    return {
      transaction: await this.findOne(transaction.id),
      balanceUpdate,
    };
  }

  // Transaction statusini o'zgartirganda balansni avtomatik yangilash
  async updateTransactionStatus(
    id: number,
    status: string
  ): Promise<ScholarshipTransaction> {
    const transaction = await this.findOne(id);
    const oldStatus = transaction.status;

    // Statusni yangilash
    await transaction.update({ status });

    // Agar status PAID ga o'zgarsa va avval processed bo'lmagan bo'lsa
    if (
      status === "PAID" &&
      oldStatus !== "PAID" &&
      !transaction.is_processed
    ) {
      await this.processScholarshipPayment(id);
    }

    // Agar status PAID dan boshqasiga o'zgarsa va avval processed bo'lgan bo'lsa
    if (status !== "PAID" && oldStatus === "PAID" && transaction.is_processed) {
      // Bu holatda balansni teskari hisoblash kerak, ammo hozircha oddiy qoldiramiz
      console.warn(
        `Transaction ${id} status changed from PAID to ${status}. Manual balance adjustment may be needed.`
      );
    }

    return this.findOne(id);
  }

  // ========== SMART QUERIES ==========

  async generateMonthlyReport(month: string, year: number): Promise<any> {
    const monthNumber = this.getMonthNumber(month);
    const startDate = new Date(year, monthNumber - 1, 1);
    const endDate = new Date(year, monthNumber, 0); // Oxirgi kun

    const transactions = await this.scholarshipTransactionModel.findAll({
      where: {
        period: month.toUpperCase(),
        payment_date: {
          [Op.between]: [startDate, endDate],
        },
        status: "PAID",
      },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email"],
        },
        {
          model: Scholarship,
          attributes: ["id", "scholarship_type"],
        },
      ],
      order: [["student_id", "ASC"]],
    });

    const totalAmount = transactions.reduce(
      (sum, transaction) => sum + parseFloat(transaction.amount.toString()),
      0
    );

    return {
      month,
      year,
      total_transactions: transactions.length,
      total_amount: totalAmount,
      transactions,
    };
  }

  async getStudentPaymentHistory(studentId: number): Promise<any> {
    const transactions = await this.scholarshipTransactionModel.findAll({
      where: {
        student_id: studentId,
        status: "PAID",
      },
      include: [
        {
          model: Scholarship,
          attributes: ["id", "scholarship_type"],
        },
      ],
      order: [["payment_date", "DESC"]],
    });

    const monthlySummary = await this.scholarshipTransactionModel.findAll({
      attributes: [
        "period",
        [fn("COUNT", col("id")), "count"],
        [fn("SUM", col("amount")), "total_amount"],
      ],
      where: {
        student_id: studentId,
        status: "PAID",
      },
      group: ["period"],
      order: [["period", "DESC"]],
      raw: true,
    });

    return {
      student_id: studentId,
      total_transactions: transactions.length,
      total_amount_received: transactions.reduce(
        (sum, t) => sum + parseFloat(t.amount.toString()),
        0
      ),
      transactions,
      monthly_summary: monthlySummary,
    };
  }

  async getPendingPayments(): Promise<ScholarshipTransaction[]> {
    return this.scholarshipTransactionModel.findAll({
      where: {
        status: "PENDING",
        payment_date: {
          [Op.lte]: new Date(), // Bugungi kungacha bo'lgan kutilayotgan to'lovlar
        },
      },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email", "phone"],
        },
        {
          model: Scholarship,
          attributes: ["id", "scholarship_type", "amount"],
        },
      ],
      order: [["payment_date", "ASC"]],
    });
  }

  async getOverduePayments(): Promise<ScholarshipTransaction[]> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return this.scholarshipTransactionModel.findAll({
      where: {
        status: "PENDING",
        payment_date: {
          [Op.lt]: yesterday, // Kecha va undan oldingi kutilayotgan to'lovlar
        },
      },
      include: [
        {
          model: Student,
          attributes: ["id", "full_name", "email", "phone"],
        },
        {
          model: Scholarship,
          attributes: ["id", "scholarship_type", "amount"],
        },
      ],
      order: [["payment_date", "ASC"]],
    });
  }

  async getMonthlySummary(year: number): Promise<any> {
    try {
      const monthlyData = await this.scholarshipTransactionModel.findAll({
        attributes: [
          "period",
          [fn("COUNT", col("id")), "transaction_count"],
          [fn("SUM", col("amount")), "total_amount"],
        ],
        where: {
          payment_date: {
            [Op.between]: [
              new Date(year, 0, 1), // Yil bosh
              new Date(year, 11, 31), // Yil oxiri
            ],
          },
        },
        group: ["period"],
        order: [[fn("MONTH", col("payment_date")), "ASC"]],
        raw: true,
      });

      return {
        year,
        monthly_summary: monthlyData,
      };
    } catch (error) {
      // Agar SQL error bo'lsa, oddiy hisob-kitob
      const transactions = await this.scholarshipTransactionModel.findAll({
        where: {
          payment_date: {
            [Op.between]: [new Date(year, 0, 1), new Date(year, 11, 31)],
          },
        },
      });

      const monthlySummary = transactions.reduce((acc: any, transaction) => {
        const period = transaction.period;
        if (!acc[period]) {
          acc[period] = {
            transaction_count: 0,
            total_amount: 0,
          };
        }
        acc[period].transaction_count++;
        acc[period].total_amount += parseFloat(transaction.amount.toString());
        return acc;
      }, {});

      return {
        year,
        monthly_summary: Object.entries(monthlySummary).map(
          ([period, stats]: [string, any]) => ({
            period,
            transaction_count: stats.transaction_count,
            total_amount: stats.total_amount,
          })
        ),
      };
    }
  }

  private getMonthNumber(month: string): number {
    const months: { [key: string]: number } = {
      JANUARY: 1,
      FEBRUARY: 2,
      MARCH: 3,
      APRIL: 4,
      MAY: 5,
      JUNE: 6,
      JULY: 7,
      AUGUST: 8,
      SEPTEMBER: 9,
      OCTOBER: 10,
      NOVEMBER: 11,
      DECEMBER: 12,
    };

    return months[month.toUpperCase()] || 1;
  }
}
