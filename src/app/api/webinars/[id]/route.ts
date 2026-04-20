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

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updatedWebinar = await prisma.webinar.update({
      where: { webinarId: id },
      data: {
        webinarName: body.webinarName,
        webinarBannerImage: body.webinarBannerImage || null,
        certificateType: body.certificateType || "Of Attendance At",
        presentedBy: body.presentedBy || "",
        presentationDate: body.presentationDate || "",
        signatoryName: body.signatoryName || "M. Olota",
        signatoryTitle: body.signatoryTitle || "IOHA President",
        signatureImage: body.signatureImage || null,
        signatory2Name: body.signatory2Name || "Chairman",
        signatory2Title: body.signatory2Title || "Chairman Education Affairs IOHA",
        signature2Image: body.signature2Image || null,
        templateId: body.templateId || "template1",
        contactHours: body.contactHours || "60 Minutes",
      },
    });

    return NextResponse.json(updatedWebinar);
  } catch (error) {
    console.error('Failed to update webinar:', error);
    return NextResponse.json({ error: 'Failed to update webinar' }, { status: 500 });
  }
}
