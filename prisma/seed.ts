import { PrismaClient, Status } from "@prisma/client";
import { hash } from "bcryptjs";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Regulations",
    slug: "regulations",
    description:
      "กติกาและข้อบังคับที่กำหนดว่ารถทำอะไรได้บ้าง — เพดานงบ ข้อจำกัดทางเทคนิค และเหตุผลเบื้องหลังกฎแต่ละข้อ",
  },
  {
    name: "Strategy",
    slug: "strategy",
    description:
      "การตัดสินใจบนพิทวอลล์ที่ตัดสินผลการแข่งขัน — จังหวะเข้าพิท การเลือกยาง และการอ่านเกมของคู่แข่ง",
  },
  {
    name: "Engineering",
    slug: "engineering",
    description:
      "อากาศพลศาสตร์ เครื่องยนต์ และระบบในรถ — เรื่องที่เกิดขึ้นก่อนรถออกจากโรงงาน",
  },
  {
    name: "History",
    slug: "history",
    description:
      "จุดเปลี่ยนในอดีตที่อธิบายว่าทำไม F1 วันนี้ถึงเป็นแบบนี้ — ยุคสมัย การตัดสินใจ และผลที่ตามมา",
  },
];

type ArticleSeed = {
  title: string;
  slug: string;
  categorySlug: string;
  excerpt: string;
  metaTitle: string | null;
  metaDescription: string | null;
  status: Status;
  publishedAt: string | null;
  updatedAt: string;
};

const articles: ArticleSeed[] = [
  {
    title: "Undercut vs Overcut ต่างกันยังไง",
    slug: "undercut-vs-overcut",
    categorySlug: "strategy",
    excerpt:
      "เข้าพิทก่อนคู่แข่งเพื่อวิ่งบนยางใหม่ กับอยู่ต่อเพื่อรอ track ว่าง — สองกลยุทธ์นี้เลือกจากอะไร และทำไมสนามอย่าง Monaco ทำให้คำตอบพลิก",
    metaTitle: "Undercut vs Overcut ต่างกันยังไง | Apex Notes",
    metaDescription:
      "อธิบายกลยุทธ์เข้าพิทของ F1: undercut ใช้ความเร็วยางใหม่ overcut ใช้ traffic ของคู่แข่ง พร้อมเงื่อนไขที่ทำให้แต่ละแบบได้ผล",
    status: Status.PUBLISHED,
    publishedAt: "2026-08-28T09:00:00+07:00",
    updatedAt: "2026-09-01T11:30:00+07:00",
  },
  {
    title: "Budget cap คืออะไร ทำไมทีมใหญ่ปวดหัว",
    slug: "budget-cap",
    categorySlug: "regulations",
    excerpt:
      "เพดานงบต่อฤดูกาลบังคับให้ทีมเลือกว่าจะลงเงินกับอะไร ตัดอะไร และทำไมทีมที่เคยใช้เงินไม่อั้นเจ็บหนักที่สุด",
    metaTitle: "Budget cap ใน F1 คืออะไร ทำไมทีมใหญ่ถึงเจ็บหนักกว่า",
    metaDescription:
      "เพดานงบประมาณ F1 ครอบคลุมอะไรบ้าง ทำไมทีมใหญ่ปรับตัวยากกว่า และมันเปลี่ยนวิธีที่ทีมตัดสินใจพัฒนารถไปอย่างไร",
    status: Status.PUBLISHED,
    publishedAt: "2026-08-21T09:00:00+07:00",
    updatedAt: "2026-08-23T14:20:00+07:00",
  },
  {
    title: "DRS ทำงานยังไง แล้วทำไมมันเปลี่ยนเกมแซง",
    slug: "how-drs-works",
    categorySlug: "engineering",
    excerpt:
      "ปีกหลังเปิดแล้วเกิดอะไรขึ้นกับแรงต้าน เงื่อนไขหนึ่งวินาที และเหตุผลที่ DRS ยังไม่ถูกยกเลิก",
    metaTitle: null,
    metaDescription: null,
    status: Status.PUBLISHED,
    publishedAt: "2026-08-14T09:00:00+07:00",
    updatedAt: "2026-08-14T09:00:00+07:00",
  },
  {
    title: "Ground effect คืออะไร",
    slug: "ground-effect",
    categorySlug: "engineering",
    excerpt:
      "พื้นรถดูดตัวรถลงกับถนนได้อย่างไร ทำไมกฎปี 2022 เอามันกลับมา และผลข้างเคียงชื่อ porpoising",
    metaTitle: "Ground effect ใน F1 คืออะไร และทำไมกฎ 2022 เอากลับมา",
    metaDescription:
      "อธิบายหลักการ ground effect ที่ดูดรถลงติดถนน เหตุผลที่กติกาปี 2022 นำกลับมาใช้ และอาการ porpoising ที่ตามมา",
    status: Status.PUBLISHED,
    publishedAt: "2026-08-06T09:00:00+07:00",
    updatedAt: "2026-08-09T16:45:00+07:00",
  },
  {
    title: "ทำไม F1 เปลี่ยนมาใช้เครื่องยนต์ไฮบริดตั้งแต่ 2014",
    slug: "hybrid-era-2014",
    categorySlug: "history",
    excerpt:
      "จาก V8 ไป V6 turbo hybrid — แรงกดดันจากผู้ผลิต ข้อจำกัดน้ำมัน และสิ่งที่แฟนเสียไปพร้อมเสียงเครื่องยนต์",
    metaTitle: null,
    metaDescription: null,
    status: Status.PUBLISHED,
    publishedAt: "2026-07-29T09:00:00+07:00",
    updatedAt: "2026-07-30T10:15:00+07:00",
  },
  {
    title: "จุดเปลี่ยนที่ Mercedes ครองแชมป์ 2014-2020",
    slug: "mercedes-dominance",
    categorySlug: "history",
    excerpt:
      "การตัดสินใจก่อนปี 2014 ที่ทำให้ทีมหนึ่งนำห่างเจ็ดฤดูกาล ไม่ใช่แค่เรื่องเครื่องยนต์อย่างที่เล่ากันสั้นๆ",
    metaTitle: "Mercedes ครองแชมป์ 2014-2020 ได้อย่างไร | Apex Notes",
    metaDescription:
      "เบื้องหลังเจ็ดฤดูกาลที่ทีมเดียวครองแชมป์ — การตัดสินใจตั้งแต่ปี 2011 การจัดวางเทอร์โบ และโครงสร้างองค์กรที่ไม่มีคอขวด",
    status: Status.PUBLISHED,
    publishedAt: "2026-07-18T09:00:00+07:00",
    updatedAt: "2026-07-18T09:00:00+07:00",
  },
  {
    title: "Tyre compound C1-C5 เลือกใช้ตอนไหน",
    slug: "tyre-compounds",
    categorySlug: "strategy",
    excerpt:
      "ยางห้าระดับต่างกันที่อะไร และทีมอ่านข้อมูลจากรอบซ้อมมาตัดสินใจอย่างไร",
    metaTitle: null,
    metaDescription: null,
    status: Status.DRAFT,
    publishedAt: null,
    updatedAt: "2026-08-31T17:05:00+07:00",
  },
  {
    title: "Safety car เปลี่ยนแผนการแข่งอย่างไร",
    slug: "safety-car-strategy",
    categorySlug: "strategy",
    excerpt: "หน้าต่างเข้าพิทฟรีที่ทุกทีมรอ และความเสี่ยงเมื่อเดิมพันผิดจังหวะ",
    metaTitle: null,
    metaDescription: null,
    status: Status.DRAFT,
    publishedAt: null,
    updatedAt: "2026-08-30T13:40:00+07:00",
  },
];

function readContent(slug: string): string {
  return readFileSync(join(process.cwd(), "prisma", "content", `${slug}.md`), "utf8").trim();
}

async function main() {
  await prisma.article.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      email: "admin@apexnotes.dev",
      name: "Apex Notes Admin",
      passwordHash: await hash("demo1234", 10),
    },
  });

  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const created = await prisma.category.create({ data: category });
    categoryIds.set(created.slug, created.id);
  }

  for (const article of articles) {
    const { categorySlug, publishedAt, updatedAt, ...rest } = article;
    const created = await prisma.article.create({
      data: {
        ...rest,
        content: readContent(article.slug),
        coverImageUrl: null,
        categoryId: categoryIds.get(categorySlug)!,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      },
    });

    // @updatedAt ignores values passed to create, so the seeded history is
    // written back directly to keep the demo timeline stable.
    await prisma.$executeRaw`UPDATE "Article" SET "updatedAt" = ${new Date(updatedAt)} WHERE id = ${created.id}`;
  }

  const published = await prisma.article.count({ where: { status: Status.PUBLISHED } });
  const draft = await prisma.article.count({ where: { status: Status.DRAFT } });
  console.log(`seeded ${categories.length} categories, ${published} published, ${draft} draft`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
