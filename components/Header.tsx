import { prisma } from '@/lib/prisma';
import HeaderClient from './HeaderClient';

export default async function Header() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        parentId: null, // Только родительские категории
      },
      include: {
        children: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return <HeaderClient categories={categories} />;
  } catch (error) {
    console.error('Error loading categories:', error);
    // Возвращаем Header без категорий в случае ошибки
    return <HeaderClient categories={[]} />;
  }
}
