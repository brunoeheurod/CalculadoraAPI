import {  Prisma } from "@prisma/client"

export class AllInOne implements Prisma.AllInOneCreateInput{
  model: string;
  nominalPower: number;
  gridVoltageReference: Prisma.GridVoltageReferenceCreateNestedOneWithoutInvertersInput;
  battery: Prisma.BatteryCreateNestedOneWithoutAllInOnesInput;
}