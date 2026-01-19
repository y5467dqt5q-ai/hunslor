import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function getUserId(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

// GET - получить профиль пользователя
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        dateOfBirth: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Парсим адрес если он есть
    let parsedAddress = null;
    if (user.address) {
      try {
        parsedAddress = JSON.parse(user.address);
      } catch {
        parsedAddress = { street: user.address, city: '', postalCode: '', country: 'Deutschland' };
      }
    }

    return NextResponse.json({
      ...user,
      address: parsedAddress,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Profils' },
      { status: 500 }
    );
  }
}

// PUT - обновить профиль пользователя
export async function PUT(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, phone, address, dateOfBirth } = body;

    // Проверяем, что email уникален (если изменяется)
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: 'Diese E-Mail-Adresse ist bereits vergeben' },
          { status: 400 }
        );
      }
    }

    // Форматируем адрес в JSON
    let addressJson = null;
    if (address) {
      if (typeof address === 'string') {
        addressJson = address;
      } else {
        addressJson = JSON.stringify(address);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(addressJson !== undefined && { address: addressJson || null }),
        ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth || null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        dateOfBirth: true,
        updatedAt: true,
      },
    });

    // Парсим адрес для ответа
    let parsedAddress = null;
    if (updatedUser.address) {
      try {
        parsedAddress = JSON.parse(updatedUser.address);
      } catch {
        parsedAddress = { street: updatedUser.address, city: '', postalCode: '', country: 'Deutschland' };
      }
    }

    return NextResponse.json({
      ...updatedUser,
      address: parsedAddress,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Profils' },
      { status: 500 }
    );
  }
}
