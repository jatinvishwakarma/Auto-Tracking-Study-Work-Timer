import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { id: "owner" },
    update: {},
    create: {
      id: "owner",
      name: "Jatin",
      email: "owner@tracker.local",
    },
  });
  console.log("User upserted successfully:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
