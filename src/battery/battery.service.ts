import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Battery, Prisma, PrismaClient } from '@prisma/client';


export const prisma = new PrismaClient()
  .$extends({
    result: {
      battery: {
        nominalEnergy: {
          needs: { voltage: true, current: true },
          compute(battery) {
            return battery.voltage * battery.current;
          },
        },
      },
    },
  })
  .$extends({
    result: {
      battery: {
        correctedEnergy: {
          needs: { nominalEnergy: true, dod: true },
          compute(battery) {
            return  battery.nominalEnergy * battery.dod;
          },
        },
      },
    },
  });
type ExtendedBattery = Battery & {
  correctedEnergy: number;
  nominalEnergy: number;
};

@Injectable()
export class BatteryService {
  constructor(private prisma: PrismaService) {}

  async getBattery(
    batteryWhereUniqueInput: Prisma.BatteryWhereUniqueInput,
  ): Promise<ExtendedBattery | null> {
    return prisma.battery.findUnique({
      where: batteryWhereUniqueInput,
    });
  }

  async getBatteries(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BatteryWhereUniqueInput;
    where?: Prisma.BatteryWhereInput;
    orderBy?: Prisma.BatteryOrderByWithRelationInput;
  }): Promise<ExtendedBattery[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return prisma.battery.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createBattery(data: Prisma.BatteryCreateInput): Promise<ExtendedBattery> {
    return prisma.battery.create({
      data,
    });
  }

  async updateBattery(params: {
    where: Prisma.BatteryWhereUniqueInput;
    data: Prisma.BatteryUpdateInput;
  }): Promise<ExtendedBattery> {
    const { data, where } = params;
    return prisma.battery.update({
      data,
      where,
    });
  }

  async deleteBattery(where: Prisma.BatteryWhereUniqueInput): Promise<ExtendedBattery> {
    return prisma.battery.delete({
      where,
    });
  }
}
