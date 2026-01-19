import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Добавление вариантов Deep Blue для iPhone 17 Pro...')

  const product = await prisma.product.findUnique({
    where: { slug: 'iphone-17-pro' },
    include: { variants: true },
  })

  if (!product) {
    console.error('iPhone 17 Pro не найден!')
    return
  }

  console.log(`Найдено существующих вариантов: ${product.variants.length}`)

  // Проверяем, есть ли уже Deep Blue варианты
  const existingDeepBlue = product.variants.filter((v) => v.color === 'Deep Blue')
  
  if (existingDeepBlue.length > 0) {
    console.log('Варианты Deep Blue уже существуют, обновляем...')
    // Удаляем старые Deep Blue варианты
    await prisma.productVariant.deleteMany({
      where: {
        productId: product.id,
        color: 'Deep Blue',
      },
    })
  }

  // Добавляем новые варианты Deep Blue
  const deepBlueVariants = [
    {
      color: 'Deep Blue',
      memory: '256GB',
      priceModifier: 0,
      images: JSON.stringify(['/images/products/iphone-17-pro-deepblue-256.jpg']),
      stock: 20,
      inStock: true,
      sku: 'IP17P-DB-256',
      productId: product.id,
    },
    {
      color: 'Deep Blue',
      memory: '512GB',
      priceModifier: 200,
      images: JSON.stringify(['/images/products/iphone-17-pro-deepblue-512.jpg']),
      stock: 15,
      inStock: true,
      sku: 'IP17P-DB-512',
      productId: product.id,
    },
    {
      color: 'Deep Blue',
      memory: '1TB',
      priceModifier: 500,
      images: JSON.stringify(['/images/products/iphone-17-pro-deepblue-1tb.jpg']),
      stock: 10,
      inStock: true,
      sku: 'IP17P-DB-1TB',
      productId: product.id,
    },
  ]

  for (const variant of deepBlueVariants) {
    await prisma.productVariant.create({
      data: variant,
    })
    console.log(`✅ Добавлен вариант: ${variant.color} ${variant.memory}`)
  }

  console.log('✅ Все варианты Deep Blue добавлены!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
