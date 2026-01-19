/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [],
    unoptimized: true, // Отключаем оптимизацию для локальных изображений через API
    // Разрешаем загрузку изображений через наш API
    domains: [],
  },
  // Отключаем предупреждения о гидратации в консоли (только для разработки)
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  eslint: {
    // Игнорируем ESLint ошибки во время сборки для продакшена
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Игнорируем TypeScript ошибки во время сборки для продакшена
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
