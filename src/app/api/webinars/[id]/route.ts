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

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    // First delete all associated certificates to avoid orphan records
    await prisma.certificate.deleteMany({
      where: { webinarId: id }
    });

    // Then delete the webinar itself
    const deletedWebinar = await prisma.webinar.delete({
      where: { webinarId: id }
    });

    return NextResponse.json({ success: true, deleted: deletedWebinar });
  } catch (error) {
    console.error('Failed to delete webinar:', error);
    return NextResponse.json({ error: 'Failed to delete webinar' }, { status: 500 });
  }
}
