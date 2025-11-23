import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const existingPro = await prisma.plan.findFirst({ where: { name: 'Pro' } });
  if (!existingPro) {
    await prisma.plan.create({
      data: {
        name: 'Pro',
        dailyLimit: 20,
        monthlyPrice: 2900
      }
    });
    console.log('Created Pro plan');
  }

  const existingFree = await prisma.plan.findFirst({ where: { name: 'Free' } });
  if (!existingFree) {
    await prisma.plan.create({
      data: {
        name: 'Free',
        dailyLimit: 3,
        monthlyPrice: 0
      }
    });
    console.log('Created Free plan');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
