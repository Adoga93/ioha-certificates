import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const webinar = await prisma.webinar.findUnique({
      where: { webinarId: id },
      select: {
          webinarId: true,
          webinarName: true,
          webinarBannerImage: true,
      }
    });

    if (!webinar) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(webinar);
  } catch (error) {
    console.error('Failed to fetch webinar:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
