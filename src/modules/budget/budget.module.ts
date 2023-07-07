import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { Budgets } from './entity/budget.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Budgets]), UserModule],
  controllers: [BudgetController],
  providers: [BudgetService],
})
export class BudgetModule {}
