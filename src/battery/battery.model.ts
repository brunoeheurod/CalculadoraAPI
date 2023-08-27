import { $Enums, Prisma } from "@prisma/client"

export class Battery implements Prisma.BatteryCreateInput{
    model: string;
    lifespan: number;
    dod: number;
    voltage: number;
    current: number;
    batteryType: $Enums.BatteryType;
    brand: Prisma.BrandCreateNestedOneWithoutBatteriesInput;
    id: number;
    
}