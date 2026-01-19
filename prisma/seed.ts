import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create main categories
  const smartphones = await prisma.category.upsert({
    where: { slug: 'smartphones' },
    update: {},
    create: {
      name: 'Smartphones',
      slug: 'smartphones',
      icon: '📱',
      order: 1,
    },
  });

  const smartwatches = await prisma.category.upsert({
    where: { slug: 'smartwatches' },
    update: {},
    create: {
      name: 'Smartwatches',
      slug: 'smartwatches',
      icon: '⌚',
      order: 2,
    },
  });

  const headphones = await prisma.category.upsert({
    where: { slug: 'headphones' },
    update: {},
    create: {
      name: 'Headphones',
      slug: 'headphones',
      icon: '🎧',
      order: 3,
    },
  });

  const laptops = await prisma.category.upsert({
    where: { slug: 'laptops' },
    update: {},
    create: {
      name: 'Laptops',
      slug: 'laptops',
      icon: '💻',
      order: 4,
    },
  });

  const tvs = await prisma.category.upsert({
    where: { slug: 'tvs' },
    update: {},
    create: {
      name: 'TVs',
      slug: 'tvs',
      icon: '📺',
      order: 5,
    },
  });

  const gameConsoles = await prisma.category.upsert({
    where: { slug: 'game-consoles' },
    update: {},
    create: {
      name: 'Game Consoles',
      slug: 'game-consoles',
      icon: '🎮',
      order: 6,
    },
  });

  const vrHeadsets = await prisma.category.upsert({
    where: { slug: 'vr-headsets' },
    update: {},
    create: {
      name: 'VR Headsets',
      slug: 'vr-headsets',
      icon: '🥽',
      order: 7,
    },
  });

  const raybanMeta = await prisma.category.upsert({
    where: { slug: 'ray-ban-meta' },
    update: {},
    create: {
      name: 'Ray-Ban Meta',
      slug: 'ray-ban-meta',
      icon: '🕶️',
      order: 8,
    },
  });

  const dyson = await prisma.category.upsert({
    where: { slug: 'dyson' },
    update: {},
    create: {
      name: 'Dyson',
      slug: 'dyson',
      icon: '🌀',
      isMegaMenu: true,
      order: 9,
    },
  });

  // Create Apple mega menu category
  const apple = await prisma.category.upsert({
    where: { slug: 'apple' },
    update: {},
    create: {
      name: 'Apple',
      slug: 'apple',
      icon: '🍎',
      isMegaMenu: true,
      order: 0,
    },
  });

  // Create Apple subcategories
  const iphone = await prisma.category.upsert({
    where: { slug: 'iphone' },
    update: {},
    create: {
      name: 'iPhone',
      slug: 'iphone',
      parentId: apple.id,
      order: 1,
    },
  });

  const mac = await prisma.category.upsert({
    where: { slug: 'mac' },
    update: {},
    create: {
      name: 'Mac',
      slug: 'mac',
      parentId: apple.id,
      order: 2,
    },
  });

  const ipad = await prisma.category.upsert({
    where: { slug: 'ipad' },
    update: {},
    create: {
      name: 'iPad',
      slug: 'ipad',
      parentId: apple.id,
      order: 3,
    },
  });

  const watch = await prisma.category.upsert({
    where: { slug: 'watch' },
    update: {},
    create: {
      name: 'Watch',
      slug: 'watch',
      parentId: apple.id,
      order: 4,
    },
  });

  const airpods = await prisma.category.upsert({
    where: { slug: 'airpods' },
    update: {},
    create: {
      name: 'AirPods',
      slug: 'airpods',
      parentId: apple.id,
      order: 5,
    },
  });

  const appleAccessories = await prisma.category.upsert({
    where: { slug: 'apple-accessories' },
    update: {},
    create: {
      name: 'Accessories',
      slug: 'apple-accessories',
      parentId: apple.id,
      order: 6,
    },
  });

  // Create iPhone models
  await prisma.category.upsert({
    where: { slug: 'iphone-17-pro-max' },
    update: {},
    create: {
      name: 'iPhone 17 Pro Max',
      slug: 'iphone-17-pro-max',
      parentId: iphone.id,
      order: 1,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'iphone-17-pro' },
    update: {},
    create: {
      name: 'iPhone 17 Pro',
      slug: 'iphone-17-pro',
      parentId: iphone.id,
      order: 2,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'iphone-17-air' },
    update: {},
    create: {
      name: 'iPhone 17 Air',
      slug: 'iphone-17-air',
      parentId: iphone.id,
      order: 3,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'iphone-17' },
    update: {},
    create: {
      name: 'iPhone 17',
      slug: 'iphone-17',
      parentId: iphone.id,
      order: 4,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'iphone-16' },
    update: {},
    create: {
      name: 'iPhone 16',
      slug: 'iphone-16',
      parentId: iphone.id,
      order: 5,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'iphone-15' },
    update: {},
    create: {
      name: 'iPhone 15',
      slug: 'iphone-15',
      parentId: iphone.id,
      order: 5,
    },
  });

  // Create Mac models
  await prisma.category.upsert({
    where: { slug: 'imac' },
    update: {},
    create: {
      name: 'iMac',
      slug: 'imac',
      parentId: mac.id,
      order: 3,
    },
  });

  // Create Dyson subcategories
  const dysonHair = await prisma.category.upsert({
    where: { slug: 'dyson-hair' },
    update: {},
    create: {
      name: 'Hair',
      slug: 'dyson-hair',
      parentId: dyson.id,
      order: 1,
    },
  });

  const dysonHome = await prisma.category.upsert({
    where: { slug: 'dyson-home' },
    update: {},
    create: {
      name: 'Home',
      slug: 'dyson-home',
      parentId: dyson.id,
      order: 2,
    },
  });

  const dysonAccessories = await prisma.category.upsert({
    where: { slug: 'dyson-accessories' },
    update: {},
    create: {
      name: 'Accessories',
      slug: 'dyson-accessories',
      parentId: dyson.id,
      order: 3,
    },
  });

  console.log('✅ Categories seeded successfully!');
  
  // Импортируем продукты после создания категорий
  console.log('\n🛍️ Importing products...');
  try {
    const { importProductsFromFolder } = await import('../lib/import-products');
    const products = importProductsFromFolder();
    console.log(`Found ${products.length} products to import`);

    for (const productData of products) {
      // Пропускаем MacBook
      if (productData.model.toLowerCase().includes('macbook') || 
          productData.name.toLowerCase().includes('macbook') ||
          productData.slug.toLowerCase().includes('macbook')) {
        console.log(`⏭️ Skipping MacBook: ${productData.name}`);
        continue;
      }
      
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
          folderName: productData.folderName || null,
        },
        create: {
          slug: productData.slug,
          folderName: productData.folderName || null,
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
            // Для iPhone 17 моделей variantPath содержит полное название папки
            // Сохраняем его в images JSON для последующего использования
            const imageData: { images: string[]; variantPath?: string } = {
              images: [],
            };
            
            if (variantData.variantPath) {
              // Если variantPath содержит полное название папки (для iPhone 17), сохраняем его
              if (variantData.variantPath.includes('Apple iPhone 17')) {
                imageData.variantPath = variantData.variantPath;
                // Изображения будут загружаться через API по полному пути
                images.push(`${variantData.variantPath}/01-main.webp`);
              } else {
                // Обычный подпапка варианта
                images.push(`${productData.slug}/${variantData.variantPath}/01-main.webp`);
              }
            } else {
              // Изображения из основной папки
              images.push(`${productData.slug}/01-main.webp`);
            }
            
            imageData.images = images;

            await prisma.productVariant.create({
              data: {
                productId: product.id,
                color: variantData.color || null,
                memory: variantData.memory || null,
                size: variantData.size || null,
                ram: variantData.ram || null,
                storage: variantData.storage || null,
                priceModifier: variantData.priceModifier,
                images: JSON.stringify(imageData), // Сохраняем объект с variantPath
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
    // Не прерываем выполнение, если импорт продуктов не удался
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
