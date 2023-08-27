import { Prisma } from "@prisma/client";

export class Inverter implements Prisma.InverterCreateInput{
    model: string;
    batteryVoltage: string;
    nominalPower: number;
    gridVoltageReference: Prisma.GridVoltageReferenceCreateNestedOneWithoutInvertersInput;

}