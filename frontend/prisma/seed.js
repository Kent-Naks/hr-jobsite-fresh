const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


async function main() {
  const cats = [
    ["business","Business Jobs"],["hr","HR & Recruitment"],["admin","Administrative Jobs"],
    ["marketing","Marketing & Brand"],["sales","Sales & Biz-Dev"],["account","Account & Client Management"],
    ["operations","Operations"],["projects","Project Management"],["strategy","Strategy & Policy"],
    ["logistics","Logistics & Supply Chain"],["legal","Legal & Compliance"],["it","IT & Tech"],
  ];
  for (const [slug,label] of cats) {
    await prisma.category.upsert({ where:{ slug }, update:{ label }, create:{ slug, label } });
  }
  console.log("✅ Seeded categories");
}
main().finally(()=>prisma.$disconnect());
