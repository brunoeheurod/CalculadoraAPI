import { batteries } from './batteries';
import { brands } from './brands';
import { grids } from './grids';
import { inverters } from './inverters'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

async function main(){
    // for (const grid of grids) {
    //     await prisma.gridVoltageReference.create({
    //         data: grid
    //     })
    // }
    // for (const brand of brands) {
    //     await prisma.brand.create({
    //         data: brand
    //     })
    // }
    // for (const battery of batteries) {
    //     await prisma.battery.create({
    //         data: battery
    //     })
    // }
    // for (const inverter of inverters) {
    //     await prisma.inverter.create({
    //         data: inverter
    //     })
    // }
}

main().catch(e => {
    console.log(e);
    process.exit(1)
}).finally(() => {
    prisma.$disconnect();
})