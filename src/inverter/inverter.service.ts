import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Inverter, Prisma } from '@prisma/client';

@Injectable()
export class InverterService {
  constructor(private prisma: PrismaService) {}

  async getInverter(
    InverterWhereUniqueInput: Prisma.InverterWhereUniqueInput,
  ): Promise<Inverter | null> {
    return this.prisma.inverter.findUnique({
      where: InverterWhereUniqueInput,
    });
  }

  async getInverters(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.InverterWhereUniqueInput;
    where?: Prisma.InverterWhereInput;
    orderBy?: Prisma.InverterOrderByWithRelationInput;
  }): Promise<Inverter[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.inverter.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createInverter(data: Prisma.InverterCreateInput): Promise<Inverter> {
    return this.prisma.inverter.create({
      data,
    });
  }

  async updateInverter(params: {
    where: Prisma.InverterWhereUniqueInput;
    data: Prisma.InverterUpdateInput;
  }): Promise<Inverter> {
    const { data, where } = params;
    return this.prisma.inverter.update({
      data,
      where,
    });
  }

  async deleteInverter(
    where: Prisma.InverterWhereUniqueInput,
  ): Promise<Inverter> {
    return this.prisma.inverter.delete({
      where,
    });
  }
}
