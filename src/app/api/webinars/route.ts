import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const webinars = await prisma.webinar.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(webinars);
  } catch (error) {
    console.error('Failed to fetch webinars:', error);
    return NextResponse.json({ error: 'Failed to fetch webinars' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Generate a unique 6-character shortcode
    const webinarId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const webinar = await prisma.webinar.create({
      data: {
        webinarId,
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
    
    return NextResponse.json(webinar, { status: 201 });
  } catch (error) {
    console.error('Failed to create webinar:', error);
    return NextResponse.json({ error: 'Failed to create webinar' }, { status: 500 });
  }
}
