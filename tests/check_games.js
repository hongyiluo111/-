require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

async function main() {
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
  const prisma = new PrismaClient({ adapter });
  const games = await prisma.companion.groupBy({ by: ["game"], _count: { id: true } });
  console.log("Games in DB:");
  games.forEach(g => console.log("  " + g.game + ": " + g._count.id));
  await prisma.$disconnect();
}
main().catch(console.error);
