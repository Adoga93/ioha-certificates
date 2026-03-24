import { NextResponse } from 'next/server';
import { generateCertificatePdf } from '@/lib/pdf';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {

        const body = await request.json();
        const { name, courseName, issueDate } = body;

        const settings = await prisma.signatorySettings.findUnique({ where: { id: 1 } }) || {
            id: 1,
            signatoryName: "M. Olota",
            signatoryTitle: "IOHA President",
            signatureImage: null,
            signatory2Name: "Chairman",
            signatory2Title: "Chairman Education Affairs IOHA",
            signature2Image: null,
            certificateType: "Of Attendance At",
            presentedBy: "Occupational Hygiene Masterclass",
            presentationDate: new Date().toISOString().split('T')[0],
            templateId: "template1",
            contactHours: "60 Minutes",
            updatedAt: new Date()
        } as any;

        // Generate a unique certificate ID
        const certificateId = crypto.randomUUID().split('-')[0].toUpperCase();

        const pdfBytes = await generateCertificatePdf({
            name: name || "Jane Doe",
            courseName: courseName || "Certified Premium Professional",
            issueDate: issueDate || new Date().toISOString().split('T')[0],
            certificateId,
            signatoryName: settings.signatoryName,
            signatoryTitle: settings.signatoryTitle,
            signatureImage: settings.signatureImage,
            signatory2Name: settings.signatory2Name,
            signatory2Title: settings.signatory2Title,
            signature2Image: settings.signature2Image,
            certificateType: settings.certificateType,
            presentedBy: settings.presentedBy,
            presentationDate: settings.presentationDate,
            templateId: (settings as any).templateId || "template1"
        });

        // We save to Prisma
        await prisma.certificate.create({
            data: {
                name: name || "Jane Doe",
                courseName: courseName || "Certified Premium Professional",
                issueDate: new Date(issueDate || new Date()),
                certificateId,
            }
        });

        // Convert Uint8Array to ArrayBuffer for native Response support
        const buffer = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteLength + pdfBytes.byteOffset) as ArrayBuffer;

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="ioha-certificate-${certificateId}.pdf"`,
            },
        });
    } catch (err) {
        console.error("PDF generation error:", err);
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to generate PDF' }, { status: 500 });
    }
}
