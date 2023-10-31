import { BatteryType } from '@prisma/client';

type BatteryParams = {
  correctedEnergy: number;
  batteryType: BatteryType;
  lifespan: number;
};

function divideLargerBySmaller(a: number, b: number): number {
  return a >= b ? a / b : b / a;
}

export default function BatteryQnty(
  voltage: number,
  current: number,
  totalEnergy: number,
  dod: number,
  fcBattery = 0.87,
  batteryType: BatteryType,
): number {
  const fcCorrectedEnergy = totalEnergy / (dod * fcBattery);

  switch (batteryType) {
    case 'LITHIUM':
      return Math.ceil(fcCorrectedEnergy / (voltage * current));
    case 'LEAD_ACID':
      return Math.ceil(fcCorrectedEnergy / (4 * voltage * current)) * 4;
  }
}

export function BatteryComparison(
  {
    correctedEnergy: cEnergyA,
    batteryType: bTypeA,
    lifespan: LSA,
  }: BatteryParams,
  {
    correctedEnergy: cEnergyB,
    batteryType: bTypeB,
    lifespan: LSB,
  }: BatteryParams,
): number {
  switch (`${bTypeA} | ${bTypeB}`) {
    case 'LITHIUM | LEAD_ACID':
      return Math.ceil((cEnergyA / cEnergyB) * 4 * (LSA / LSB));
    case 'LEAD_ACID | LITHIUM':
      return Math.ceil((cEnergyB / cEnergyA) * 4 * (LSB / LSA));
    case 'LITHIUM | LITHIUM':
      return Math.ceil(
        divideLargerBySmaller(cEnergyA, cEnergyB) *
          divideLargerBySmaller(LSA, LSB),
      );
    case 'LEAD_ACID | LEAD_ACID':
      return Math.ceil(
        divideLargerBySmaller(cEnergyA, cEnergyB) *
          divideLargerBySmaller(LSA, LSB),
      );
  }
}

export function coefLV(
  batteryQty: number,
  inverterQty: number,
  batteryCurrent: number,
  CDCurrent: number,
) {
  return (batteryQty * batteryCurrent) / (inverterQty * CDCurrent);
}

export function coefHV(
  batteryQty: number,
  inverterQty: number,
  correctedEnergy: number,
  inverterNominalPower: number,
) {
  return (correctedEnergy * batteryQty) / (inverterQty * inverterNominalPower);
}

export function adjustedInverterQty(
  inverterQty: number,
  coef: number
) {
  if ( coef > 10 ) {
    return Math.ceil((inverterQty * coef) / 10);
  }

  return inverterQty;
}

export function adjustedBatteryQty(
  batteryQty: number,
  coef: number,
) {
  if (coef < 1) {
    return Math.ceil(batteryQty / coef); 
  }
  return batteryQty;
}