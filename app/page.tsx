import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import CategoryButton from '@/components/CategoryButton';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Находим первый продукт iPhone 17 Pro Max для hero-секции
  const iphoneProduct = await prisma.product.findFirst({
    where: {
      OR: [
        { model: { contains: 'iPhone 17 Pro Max' } },
        { model: { contains: 'iphone 17 pro max' } },
        { slug: { contains: 'iphone-17-pro-max' } },
        { folderName: { contains: 'iPhone 17 Pro Max' } },
        { folderName: { contains: 'iphone 17 pro max' } },
      ],
    },
    select: { slug: true },
  });

  const productHref = iphoneProduct ? `/products/${iphoneProduct.slug}` : '/catalog?category=iphone';


  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-neon-green to-neon-green-dark bg-clip-text text-transparent">
            HUNSLOR
          </h1>
          <p className="text-xl text-text-muted">Premium Tech Store</p>
        </div>
        
        {/* Hero Section с изображением iPhone */}
        <div className="mb-16 max-w-7xl mx-auto">
          <Link href={productHref} className="block group">
            <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border overflow-hidden hover:border-neon-green/50 transition-all duration-300 hover:shadow-neon">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12">
                <div className="flex items-center justify-center">
                  <div className="relative w-full h-96 lg:h-[500px] bg-gradient-to-br from-card-bg-start to-card-bg-end">
                    <img
                      src="/api/images/Apple iPhone 17 Pro Max 256GB (Deep Blue)/Deep Blue-2-1397x1397.png.webp"
                      alt="Apple iPhone 17 Pro Max"
                      className="w-full h-full object-contain"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-center space-y-6">
                  <div>
                    <h2 className="text-4xl lg:text-5xl font-bold mb-2 group-hover:text-neon-green transition-colors duration-300">
                      Apple iPhone 17 Pro Max
                    </h2>
                    <p className="text-text-muted text-lg">Das leistungsstärkste iPhone</p>
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-neon-green">
                    Ab 1.039,20 €
                  </div>
                  <div className="pt-4">
                    <div className="inline-block px-6 py-3 rounded-button border border-neon-green text-neon-green hover:bg-neon-green/10 transition-all duration-300 group-hover:shadow-neon">
                      Jetzt entdecken →
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Категории */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Kategorien</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {/* Smartphone */}
            <CategoryButton
              href="/catalog?category=smartphones"
              folderName="smartphone"
              displayName="Smartphone"
              imageFileName="Smartphone.png.webp"
            />

            {/* Watch */}
            <CategoryButton
              href="/catalog?category=smartwatches"
              folderName="watch"
              displayName="Smartwatch"
              imageFileName="Watch.png.webp"
            />

            {/* Console */}
            <CategoryButton
              href="/catalog?category=game-consoles"
              folderName="console"
              displayName="Konsole"
              imageFileName="Konsole.png.webp"
            />

            {/* VR */}
            <CategoryButton
              href="/catalog?category=vr-headsets"
              folderName="vr"
              displayName="VR"
              imageFileName="VR.png.webp"
            />

            {/* Headphone */}
            <CategoryButton
              href="/catalog?category=headphones"
              folderName="headphone"
              displayName="Kopfhörer"
              imageFileName="Headphone.png.webp"
            />

            {/* Dyson */}
            <CategoryButton
              href="/catalog?category=dyson"
              folderName="dyson"
              displayName="Dyson"
              imageFileName="Dyson.png.webp"
            />

            {/* Camera */}
            <CategoryButton
              href="/catalog?category=camera"
              folderName="camera"
              displayName="Kamera"
              imageFileName="Kamera.png.webp"
            />

            {/* Laptop */}
            <CategoryButton
              href="/catalog?category=laptops"
              folderName="laptop"
              displayName="Laptop"
              imageFileName="Laptop.png.webp"
            />

            {/* TV */}
            <CategoryButton
              href="/catalog?category=tv"
              folderName="tv"
              displayName="TV"
              imageFileName="TV.png.webp"
            />

            {/* Smart Home */}
            <CategoryButton
              href="/catalog?category=smart-home"
              folderName="smart-home"
              displayName="Smart Home"
              imageFileName="SmartHome.png.webp"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
