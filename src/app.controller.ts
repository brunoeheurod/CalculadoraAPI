/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { BatteryService, prisma } from './battery/battery.service';
import { InverterService } from './inverter/inverter.service';
import { AllInOneService } from './allInOne/allInOne.service';
import {
  Battery as BatteryModel,
  Inverter as InverterModel,
  AllInOne as AllInOneModel,
  GridVoltageReference as GridModel,
  Brand as BrandModel,
  BatteryType,
} from '@prisma/client';
import BatteryQnty, {
  BatteryComparison,
  adjustedBatteryQty,
  adjustedInverterQty,
  coefHV,
  coefLV,
} from './utils/calculations';

@Controller()
export class AppController {
  constructor(
    private readonly BatteryService: BatteryService,
    private readonly InverterService: InverterService,
    private readonly AllInOneService: AllInOneService,
  ) {}

  @Get('')
  async Default() {
    return 'Welcome to the Inverter Calculator API';
  }

  @Post('calculate-coef')
  async getCoef(
    @Body()
    requestBody: {
      batteryQty: number;
      inverterQty: number;
    },
  ): Promise<any> {
    return;
  }

  @Post('calculate-batteries')
  async getBatteriesQuantity(
    @Body()
    requestBody: {
      model: string;
      tEnergy: number;
      fc: number;
      coef?: number;
    },
  ): Promise<any> {
    const { model, tEnergy, fc, coef } = requestBody;

    const {
      voltage,
      current,
      dod,
      batteryType,
      nominalEnergy,
      brandId,
      lifespan,
    } = await this.BatteryService.getBattery({
      model: model,
    });
    const { name: brandName } = await prisma.brand.findUnique({
      where: {
        id: brandId,
      },
    });
    const qnty = BatteryQnty(voltage, current, tEnergy, dod, fc, batteryType);
    const quotationBattery = {
      modelFullName: `${brandName} - ${model}`,
      nominalVoltage: `${voltage}V`,
      nominalEnergy: nominalEnergy / 1000,
      dod: dod,
      lifespan: lifespan,
      quantity: coef ? adjustedBatteryQty(qnty, coef) : qnty,
    };
    return quotationBattery;
  }

  @Post('calculate-inverters')
  async getInvertersQuantity(
    @Body()
    requestBody: {
      gridVoltage: string;
      tPower: number;
      batteryModel?: string;
      batteryQty?: number;
    },
  ): Promise<any[]> {
    const { gridVoltage, tPower, batteryQty, batteryModel } = requestBody;
    const fcTPower = tPower * 1.1;
    const inverters = await this.InverterService.getInverters({
      where: { gridVoltageReference: { voltage: gridVoltage } },
    });
    const quotationList = [];

    let filteredInverters = inverters;
    if (batteryModel && batteryQty) {
      var { current, correctedEnergy } = await this.BatteryService.getBattery({
        model: batteryModel,
      });

      filteredInverters = inverters.filter((inverter) =>
        batteryModel.startsWith('BOS')
          ? inverter.batteryVoltage.startsWith('100')
          : inverter.batteryVoltage.startsWith('48'),
      );
    }

    for (const inverter of filteredInverters) {
      const inverterQty = Math.ceil(fcTPower / inverter.nominalPower);
      if (batteryModel && batteryQty) {
        var coefHVValue = coefHV(
          batteryQty,
          inverterQty,
          correctedEnergy,
          inverter.nominalPower,
        );
        var coefLVValue = coefLV(
          batteryQty,
          inverterQty,
          current,
          inverter.CDCurrent,
        );
      }
      quotationList.push({
        model: inverter.model,
        nominalPower: inverter.nominalPower,
        quantity:
          batteryModel && batteryQty
            ? adjustedInverterQty(
                inverterQty,
                inverter.batteryVoltage.startsWith('100')
                  ? coefHVValue
                  : coefLVValue,
              )
            : inverterQty,
        price: inverter.price,
        coef:
          batteryModel && batteryQty
            ? inverter.batteryVoltage.startsWith('100')
              ? coefHVValue > 10
                ? 10
                : coefHVValue
              : coefLVValue > 10
              ? 10
              : coefLVValue
            : 1,
      });
    }

    quotationList.sort((a, b) => {
      return a.price * a.quantity - b.price * b.quantity;
    });

    return quotationList.map(({ model, nominalPower, quantity, coef }) => ({
      model,
      nominalPower,
      quantity,
      coef,
    }));
  }

  @Post('compare-batteries')
  async compareBatteries(
    @Body() modelsData: { modelNameA: string; modelNameB: string },
  ): Promise<any> {
    const { modelNameA, modelNameB } = modelsData;

    const batteryA = await this.BatteryService.getBattery({
      model: modelNameA,
    });
    const batteryB = await this.BatteryService.getBattery({
      model: modelNameB,
    });

    return {
      modelA:
        batteryA.correctedEnergy > batteryB.correctedEnergy ||
        (batteryA.batteryType === 'LITHIUM' &&
          batteryB.batteryType === 'LEAD_ACID')
          ? 1
          : BatteryComparison(batteryA, batteryB),
      modelB:
        batteryB.correctedEnergy > batteryA.correctedEnergy ||
        (batteryB.batteryType === 'LITHIUM' &&
          batteryA.batteryType === 'LEAD_ACID')
          ? 1
          : BatteryComparison(batteryA, batteryB),
    };
  }

  @Get('brands')
  async getAllBrands(): Promise<BrandModel[]> {
    return prisma.brand.findMany({});
  }

  @Get('grids')
  async getAllGrids(): Promise<GridModel[]> {
    return prisma.gridVoltageReference.findMany({});
  }

  @Get('batteries')
  async getAllBatteries(): Promise<BatteryModel[]> {
    return this.BatteryService.getBatteries({
      where: {
        brandId: 1,
      },
    });
  }

  @Get('inverters')
  async getAllInverters(): Promise<InverterModel[]> {
    return this.InverterService.getInverters({});
  }

  @Get('AllInOnes')
  async getAllAllInOnes(): Promise<Omit<AllInOneModel, 'batteryId'>[]> {
    return this.AllInOneService.getAllInOnes({});
  }

  @Get('filtered-batteries/:searchString')
  async getFilteredBatteries(
    @Param('searchString') searchString: BatteryType,
  ): Promise<BatteryModel[]> {
    return this.BatteryService.getBatteries({
      where: {
        OR: [
          {
            batteryType: searchString,
          },
        ],
        AND: {
          brandId: 1,
        },
      },
    });
  }

  @Post('filtered-battery')
  async getFilteredBattery(
    @Body() searchData: { model: string },
  ): Promise<any> {
    const { model } = searchData;

    const battery = await this.BatteryService.getBattery({
      model: model,
    });

    const { name: brandName } = await prisma.brand.findUnique({
      where: {
        id: battery.brandId,
      },
    });

    return {
      ...battery,
      modelFullName: `${brandName} - ${model}`,
    };
  }

  @Post('filtered-inverters')
  async getFilteredInverters(
    @Body() searchData: { searchString: string },
  ): Promise<InverterModel[]> {
    const { searchString } = searchData;
    return this.InverterService.getInverters({
      where: {
        OR: [
          {
            gridVoltageReference: { voltage: searchString },
          },
          {
            model: { contains: searchString },
          },
        ],
      },
    });
  }

  // @Post('battery')
  // async createBattery(
  //   @Body()
  //   batteryData: {
  //     brandName: string;
  //     model: string;
  //     lifespan: number;
  //     dod: number;
  //     voltage: number;
  //     current: number;
  //     batteryType: BatteryType;
  //   },
  // ): Promise<BatteryModel> {
  //   const { model, brandName, lifespan, dod, voltage, current, batteryType } =
  //     batteryData;

  //   const brand = await prisma.brand.findUnique({
  //     where: {
  //       name: brandName,
  //     },
  //   });

  //   return this.BatteryService.createBattery({
  //     lifespan,
  //     dod,
  //     voltage,
  //     current,
  //     batteryType,
  //     model,
  //     brand: {
  //       connect: { id: brand.id },
  //     },
  //   });
  // }

  // @Post('inverter')
  // async createInverter(
  //   @Body()
  //   inverterData: {
  //     model: string;
  //     batteryVoltage: string;
  //     nominalPower: number;
  //     gridVoltage: string;
  //   },
  // ): Promise<InverterModel> {
  //   const { model, batteryVoltage, nominalPower, gridVoltage } = inverterData;

  //   const gridVoltageReference = await prisma.gridVoltageReference.findUnique({
  //     where: {
  //       voltage: gridVoltage,
  //     },
  //   });

  //   return this.InverterService.createInverter({
  //     model,
  //     batteryVoltage,
  //     nominalPower,
  //     gridVoltageReference: { connect: { id: gridVoltageReference.id } },
  //   });
  // }

  //   @Delete('inverter/:id')
  //   async deleteInverter(@Param('id') id: string): Promise<InverterModel> {
  //     return this.InverterService.deleteInverter({ id: Number(id) });
  //   }
}
