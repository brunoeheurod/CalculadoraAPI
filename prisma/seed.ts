// import { batteries } from './batteries';
// import { brands } from './brands';
// import { grids } from './grids';
// import { inverters } from './inverters'
// import { allInOnes } from './allInOnes'
// import { updatedInverters } from './updatedInverters';
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
    // for (const allInOne of allInOnes) {
    //     await prisma.allInOne.create({
    //         data: allInOne
    //     })
    // }

    // for (const updatedInverter of updatedInverters) {
    // await prisma.inverter.update({
    //     ...updatedInverter
    // })}
} // npx prisma db seed -- --environment development

main().catch(e => {
    console.log(e);
    process.exit(1)
}).finally(() => {
    prisma.$disconnect();
})