import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seed...');

  // 1. Create Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@kanban.ai' },
    update: {},
    create: {
      email: 'demo@kanban.ai',
      name: 'Nguyen Van Dev',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenDev',
      role: 'USER',
    },
  });

  console.log(`👤 User created/verified: ${demoUser.email} (ID: ${demoUser.id})`);

  // 2. Create Default Board
  let board = await prisma.board.findFirst({
    where: { userId: demoUser.id },
  });

  if (!board) {
    board = await prisma.board.create({
      data: {
        userId: demoUser.id,
        title: 'Sprint Quản Lý Cá Nhân',
        description: 'Bảng Kanban phát triển kỹ năng và theo dõi mục tiêu hàng ngày',
      },
    });

    const columnsData = [
      { title: 'Backlog', orderIndex: 0, colorHex: '#64748b' },
      { title: 'To Do', orderIndex: 1, colorHex: '#3b82f6' },
      { title: 'In Progress', orderIndex: 2, wipLimit: 3, colorHex: '#f59e0b' },
      { title: 'In Review', orderIndex: 3, wipLimit: 2, colorHex: '#8b5cf6' },
      { title: 'Done', orderIndex: 4, colorHex: '#10b981' },
    ];

    const createdCols = [];
    for (const c of columnsData) {
      const col = await prisma.column.create({
        data: {
          boardId: board.id,
          title: c.title,
          orderIndex: c.orderIndex,
          wipLimit: c.wipLimit,
          colorHex: c.colorHex,
        },
      });
      createdCols.push(col);
    }

    // Seed initial tasks
    const todoCol = createdCols[1];
    const inProgCol = createdCols[2];
    const doneCol = createdCols[4];

    await prisma.task.create({
      data: {
        boardId: board.id,
        columnId: todoCol.id,
        title: 'Nghiên cứu Next.js App Router Server Actions',
        description: '# Mục tiêu\nTìm hiểu cách Next.js xử lý server actions và tối ưu cache.',
        priority: 'HIGH',
        orderIndex: 0,
        estimatedMins: 60,
        tags: ['Study', 'NextJS'],
        subtasks: {
          create: [
            { title: 'Đọc tài liệu chính thức Next.js', isDone: true, orderIndex: 0 },
            { title: 'Tạo prototype thử nghiệm', isDone: false, orderIndex: 1 },
          ],
        },
      },
    });

    await prisma.task.create({
      data: {
        boardId: board.id,
        columnId: inProgCol.id,
        title: 'Triển khai Clean Architecture NestJS',
        description: 'Phân tách 4 tầng Domain, Application, Infrastructure, Presentation.',
        priority: 'URGENT',
        orderIndex: 0,
        estimatedMins: 120,
        spentMins: 45,
        tags: ['Backend', 'CleanArch'],
      },
    });

    await prisma.task.create({
      data: {
        boardId: board.id,
        columnId: doneCol.id,
        title: 'Thiết kế Database Schema PostgreSQL & Prisma',
        description: 'Thiết kế ERD và schema cho Supabase và AWS RDS',
        priority: 'HIGH',
        orderIndex: 0,
        estimatedMins: 90,
        spentMins: 90,
        isCompleted: true,
        completedAt: new Date(),
        tags: ['Database', 'Prisma'],
      },
    });

    console.log('✅ Default Board and Tasks seeded successfully!');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
