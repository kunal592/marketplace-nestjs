import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './services/tasks.service';
import { PrismaModule } from '../../database/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ScheduleModule.forRoot(), PrismaModule, ConfigModule],
    providers: [TasksService],
})
export class TasksModule { }
