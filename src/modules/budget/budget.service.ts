import { Injectable, NotFoundException } from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  startOfMonth,
  subMonths,
  endOfMonth,
  eachDayOfInterval,
  format,
  eachMonthOfInterval,
  parse,
} from 'date-fns';

import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Budgets } from './entity/budget.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budgets)
    private budgetRepository: Repository<Budgets>,
    private userService: UserService,
  ) {}

  async create(createBudgetDto: CreateBudgetDto, userId: number) {
    const { name, price, date } = createBudgetDto;
    const createdBudget = this.budgetRepository.create({
      name,
      price,
      date,
      // user: userId,
      user: { id: userId },
    });
    await this.budgetRepository.save(createdBudget);

    const currentDate = new Date(createBudgetDto.date);
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    const isCurrentMonth = currentDate >= start && currentDate <= end;

    let user;
    let budgetsThisMonth;
    if (isCurrentMonth) {
      budgetsThisMonth = await this.budgetRepository
        .createQueryBuilder('budget')
        .select('SUM(budget.price)', 'total')
        .where('budget.user = :userId', { userId })
        .andWhere('budget.date >= :start', { start })
        .andWhere('budget.date <= :end', { end })
        .getRawOne();

      user = await this.userService.findById(userId);
    }

    const data = {
      totalBudgetThisMonth: budgetsThisMonth?.total || 0,
      isCurrentMonth,
      budgetLimit: user?.budgetLimit,
    };
    return data;
  }

  async findAll(
    limit: number,
    page: number,
    date: string,
    timeZone: string,
    userId: number,
  ) {
    const skip = (page - 1) * limit;
    const take = limit;

    const filter: any = { user: { id: userId } };

    if (date) {
      const parsedDate = parse(date, 'dd-MM-yyyy', new Date());
      const startOfDay = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate(),
        0,
        0,
        0,
      );
      const endOfDay = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate(),
        23,
        59,
        59,
      );

      filter.date = Between(startOfDay.toISOString(), endOfDay.toISOString());
    }

    const budgetsData = await this.budgetRepository.findAndCount({
      where: filter,
      order: {
        createdAt: 'DESC',
      },
      skip,
      take,
    });

    const budgets = budgetsData[0];
    const totalBudgets = budgetsData[1];
    const data = {
      budgets,
      totalBudgets,
      currentPage: page,
    };
    return data;
  }

  async checkLimit(userId: number) {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    const budgetsThisMonth = await this.budgetRepository
      .createQueryBuilder('budget')
      .select('SUM(budget.price)', 'total')
      .where('budget.user = :userId', { userId })
      .andWhere('budget.date >= :start', { start })
      .andWhere('budget.date <= :end', { end })
      .getRawOne();

    const user = await this.userService.findById(userId);

    const data = {
      totalBudgetThisMonth: budgetsThisMonth?.total || 0,
      budgetLimit: user?.budgetLimit,
    };
    return data;
  }

  async getAnalytics(timeZone: string, userId: number) {
    const lastMonthStartDate = startOfMonth(subMonths(new Date(), 1));
    const lastMonthEndDate = endOfMonth(subMonths(new Date(), 1));
    const last12MonthStartDate = startOfMonth(subMonths(new Date(), 12));

    const [lastMonth, last12Months] = await Promise.all([
      this.budgetRepository
        .createQueryBuilder('budget')
        .select(`TO_CHAR(budget.date, 'MM/DD')`, 'dateid')
        .addSelect('SUM(budget.price)', 'price')
        .where('budget.userId = :userId', { userId })
        .andWhere('budget.date >= :startDate', {
          startDate: lastMonthStartDate,
        })
        .andWhere('budget.date <= :endDate', { endDate: lastMonthEndDate })
        .groupBy('dateid')
        .orderBy('dateid', 'ASC')
        .getRawMany(),

      this.budgetRepository
        .createQueryBuilder('budget')
        .select(`TO_CHAR(budget.date, 'MM/YYYY')`, 'dateid')
        .addSelect('SUM(budget.price)', 'price')
        .where('budget.userId = :userId', { userId })
        .andWhere('budget.date >= :startDate', {
          startDate: last12MonthStartDate,
        })
        .andWhere('budget.date <= :endDate', { endDate: lastMonthEndDate })
        .groupBy('dateid')
        .getRawMany(),
    ]);

    const user = await this.userService.findById(userId);

    const dateRangeLastMonth = eachDayOfInterval({
      start: lastMonthStartDate,
      end: lastMonthEndDate,
    });
    const lastMonthCategories = dateRangeLastMonth.map((date) =>
      format(date, 'MM/dd'),
    );
    const lastMonthData = lastMonthCategories.map((category) => {
      const priceData = lastMonth.find((item) => category === item.dateid);
      return priceData?.price || 0;
    });

    const dateRangeLast12Month = eachMonthOfInterval({
      start: last12MonthStartDate,
      end: lastMonthEndDate,
    });
    const last12MonthsCategories = dateRangeLast12Month.map((date) =>
      format(date, 'MM/yyyy'),
    );
    const last12MonthsData = last12MonthsCategories.map((category) => {
      const priceData = last12Months.find((item) => category === item.dateid);
      return priceData?.price || 0;
    });

    const last6MonthsCategories = last12MonthsCategories.slice(6);
    const last6MonthsData = last12MonthsData.slice(6);

    const graphData = {
      lastMonth: {
        categories: lastMonthCategories,
        data: lastMonthData,
      },
      last6Months: {
        categories: last6MonthsCategories,
        data: last6MonthsData,
      },
      last12Months: {
        categories: last12MonthsCategories,
        data: last12MonthsData,
      },
      budgetLimit: user?.budgetLimit,
    };

    return graphData;
  }

  async findOne(id: number): Promise<Budgets> {
    return this.budgetRepository.findOneBy({ id });
  }
  async update(id: number, updateBudgetDto: UpdateBudgetDto): Promise<Budgets> {
    const budget = await this.budgetRepository.findOneBy({ id });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }
    this.budgetRepository.merge(budget, updateBudgetDto);
    return this.budgetRepository.save(budget);
  }

  async remove(id: number): Promise<Budgets> {
    const budget = await this.budgetRepository.findOneBy({ id });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }
    return this.budgetRepository.remove(budget);
  }
}
