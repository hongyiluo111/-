require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

async function main() {
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
  const prisma = new PrismaClient({ adapter });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, status: true, diamonds: true },
    orderBy: { createdAt: "asc" },
  });

  console.log("Total users:", users.length);
  for (const u of users) {
    console.log([u.name, u.email, "Test123456", u.role, u.status, u.diamonds].join(" | "));
  }

  await prisma.$disconnect();
}
main().catch(console.error);
