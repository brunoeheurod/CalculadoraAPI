import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AllInOne, Prisma } from '@prisma/client';
import { prisma } from '../battery/battery.service';

@Injectable()
export class AllInOneService {
  constructor(private prisma: PrismaService) {}

  async getAllInOne(
    AllInOneWhereUniqueInput: Prisma.AllInOneWhereUniqueInput,
  ): Promise<AllInOne | null> {
    return this.prisma.allInOne.findUnique({
      where: AllInOneWhereUniqueInput,
    });
  }

  async getAllInOnes(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AllInOneWhereUniqueInput;
    where?: Prisma.AllInOneWhereInput;
    orderBy?: Prisma.AllInOneOrderByWithRelationInput;
  }): Promise<Omit<AllInOne, 'batteryId'>[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return prisma.allInOne.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select: {
        id: true,
        model: true,
        nominalPower: true,
        price: true,
        gridVoltageReferenceId: true,
        battery: {
          select: {
            id: true,
            brandId: true,
            model: true,
            lifespan: true,
            dod: true,
            voltage: true,
            current: true,
            batteryType: true,
            nominalEnergy: true,
            correctedEnergy: true,
          },
        },
      },
    });
  }

  async createAllInOne(data: Prisma.AllInOneCreateInput): Promise<AllInOne> {
    return this.prisma.allInOne.create({
      data,
    });
  }

  async updateAllInOne(params: {
    where: Prisma.AllInOneWhereUniqueInput;
    data: Prisma.AllInOneUpdateInput;
  }): Promise<AllInOne> {
    const { data, where } = params;
    return this.prisma.allInOne.update({
      data,
      where,
    });
  }

  async deleteAllInOne(
    where: Prisma.AllInOneWhereUniqueInput,
  ): Promise<AllInOne> {
    return this.prisma.allInOne.delete({
      where,
    });
  }
}
