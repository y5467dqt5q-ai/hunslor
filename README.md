# Hunslor E-Commerce Platform

Modern e-commerce platform built with Next.js, Prisma, and PostgreSQL.

## Features

- Product catalog with categories
- Shopping cart
- User authentication
- Order management
- Telegram bot integration
- AI support chat
- Payment processing

## Tech Stack

- Next.js 14
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Zustand for state management

## Railway Deployment

This project is configured for deployment on Railway.

### Environment Variables

Set these in Railway dashboard:

- `JWT_SECRET` - Secret key for JWT tokens
- `TELEGRAM_BOT_TOKEN` - Telegram bot token
- `TELEGRAM_ADMIN_ID` - Telegram admin user ID
- `OPENAI_API_KEY` - OpenAI API key for AI chat
- `NODE_ENV` - Set to `production`
- `DATABASE_URL` - Automatically provided by Railway PostgreSQL

### Build Process

Railway will automatically:
1. Install dependencies (`npm ci`)
2. Generate Prisma client (`prisma generate`)
3. Push database schema (`prisma db push`)
4. Build Next.js app (`npm run build`)
5. Start the server (`npm start`)

## Local Development

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## License

Private project
