import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCertificatePdf } from '@/lib/pdf';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { webinarId, firstName, lastName } = body;

    if (!webinarId || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const webinar = await prisma.webinar.findUnique({
      where: { webinarId },
    });

    if (!webinar) {
      return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
    }

    const fullName = `${firstName} ${lastName}`.trim();
    // Generate a unique 8-character ID for the certificate
    const certificateId = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Create a record of the generated certificate
    await prisma.certificate.create({
        data: {
            name: fullName,
            courseName: webinar.webinarName,
            issueDate: new Date(),
            certificateId: certificateId,
            webinarId: webinar.webinarId // Explicit link to parent webinar
        }
    });

    // Generate the PDF
    const pdfBytes = await generateCertificatePdf({
      name: fullName,
      courseName: webinar.webinarName,
      issueDate: new Date().toISOString(),
      certificateId: certificateId,
      certificateType: webinar.certificateType,
      presentedBy: webinar.presentedBy,
      presentationDate: webinar.presentationDate,
      signatoryName: webinar.signatoryName,
      signatoryTitle: webinar.signatoryTitle,
      signatureImage: webinar.signatureImage,
      signatory2Name: webinar.signatory2Name,
      signatory2Title: webinar.signatory2Title,
      signature2Image: webinar.signature2Image,
      templateId: webinar.templateId || "template1",
    });

    // Return the generated PDF directly as a download
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${certificateId}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Failed to process claim:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
