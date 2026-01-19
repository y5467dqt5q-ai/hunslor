import { PrismaClient } from '@prisma/client';
import { importProductsFromFolder } from '../lib/import-products';

const prisma = new PrismaClient();

async function main() {
  console.log('🛍️ Importing products from local folder...');

  try {
    const products = importProductsFromFolder();
    console.log(`Found ${products.length} products to import`);

    for (const productData of products) {
      // Найти категорию
      let category = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: productData.categorySlug },
            { children: { some: { slug: productData.categorySlug } } },
          ],
        },
      });

      // Если категория не найдена, используем первую доступную
      if (!category) {
        category = await prisma.category.findFirst({
          where: { parentId: null },
        });
      }

      if (!category) {
        console.warn(`Category not found for ${productData.name}, skipping...`);
        continue;
      }

      // Создать или обновить продукт
      const product = await prisma.product.upsert({
        where: { slug: productData.slug },
        update: {
          brand: productData.brand,
          model: productData.model,
          basePrice: productData.basePrice,
          discount: productData.discount,
        },
        create: {
          slug: productData.slug,
          brand: productData.brand,
          model: productData.model,
          categoryId: category.id,
          baseDescription: `Premium ${productData.brand} ${productData.model}`,
          baseImages: JSON.stringify([]),
          basePrice: productData.basePrice,
          discount: productData.discount,
        },
      });

      // Удалить старые варианты
      await prisma.productVariant.deleteMany({
        where: { productId: product.id },
      });

      // Создать варианты
      for (const variantData of productData.variants) {
        // Получить изображения варианта
        const images: string[] = [];
        if (variantData.variantPath) {
          // Изображения будут загружаться через API
          images.push(`${productData.slug}/${variantData.variantPath}/01-main.webp`);
        } else {
          // Изображения из основной папки
          images.push(`${productData.slug}/01-main.webp`);
        }

        await prisma.productVariant.create({
          data: {
            productId: product.id,
            color: variantData.color || null,
            memory: variantData.memory || null,
            size: variantData.size || null,
            ram: variantData.ram || null,
            storage: variantData.storage || null,
            priceModifier: variantData.priceModifier,
            images: JSON.stringify(images),
            stock: variantData.stock,
            inStock: variantData.stock > 0,
            sku: variantData.sku,
          },
        });
      }

      console.log(`✅ Imported: ${productData.name}`);
    }

    console.log('✅ Products imported successfully!');
  } catch (error) {
    console.error('❌ Error importing products:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
