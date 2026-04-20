import { NextResponse } from 'next/server';
import { generateCertificatePdf } from '@/lib/pdf';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Generate the PDF
    const pdfBytes = await generateCertificatePdf({
      name: "Jane Doe",
      courseName: body.webinarName || "Sample Webinar",
      issueDate: new Date().toISOString(),
      certificateId: "SAMPLE-1234",
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
      contactHours: body.contactHours || "60 CPD minutes",
    });

    // Return the generated PDF directly
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="preview.pdf"`,
      },
    });

  } catch (error) {
    console.error('Failed to generate preview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
