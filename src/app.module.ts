import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BatteryService } from './battery/battery.service';
import { PrismaService } from './prisma.service';
import { InverterService } from './inverter/inverter.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [BatteryService, InverterService, PrismaService],
})
export class AppModule {}
